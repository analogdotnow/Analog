import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { composio } from "@repo/ai/lib/composio";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const integrationsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const connectedAccounts = await composio.connectedAccounts.list({
      userIds: [ctx.user.id],
    });

    return {
      connectedAccounts: connectedAccounts.items.map((account) => ({
        id: account.id,
        status: account.status,
        statusReason: account.statusReason,
        slug: account.toolkit.slug,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    };
  }),
  link: protectedProcedure
    .input(
      z.object({
        providerId: z.enum(["github", "linear", "notion", "attio", "gmail"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await composio.toolkits.authorize(
        ctx.user.id,
        input.providerId,
      );

      await ctx.redis.set(`composio:connection:${request.id}`, ctx.user.id, { ex: 3600 }); // 1 hour

      return {
        id: request.id,
        status: request.status,
        redirectUrl: request.redirectUrl ?? null,
      };
    }),

  finalize: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = await ctx.redis.get(`composio:connection:${input.connectionId}`);

      if (!userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid connection ID",
        });
      }

      if (userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to finalize this connection",
        });
      }

      const connection = await composio.connectedAccounts.waitForConnection(input.connectionId);

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Connection not found",
        });
      }
      
    }),
  unlink: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const connectedAccounts = await composio.connectedAccounts.list({
        userIds: [ctx.user.id],
      });

      const account = connectedAccounts.items.find(
        (account) => account.id === input.accountId,
      );

      if (!account) {
        return;
      }

      const deletedAccount = await composio.connectedAccounts.delete(
        account.id,
      );

      if (!deletedAccount.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete account",
        });
      }
    }),
});
