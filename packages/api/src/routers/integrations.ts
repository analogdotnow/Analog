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
        providerId: z.enum(["github", "linear", "notion", "attio"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await composio.toolkits.authorize(
        ctx.user.id,
        input.providerId,
      );

      return {
        id: request.id,
        status: request.status,
        redirectUrl: request.redirectUrl ?? null,
      };
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
