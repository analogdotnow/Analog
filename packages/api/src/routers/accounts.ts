import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@repo/auth/server";
import { user } from "@repo/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getActiveAccount, getAllAccounts } from "../utils/accounts";

export const accountsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await getAllAccounts(ctx.user, ctx.headers);

    return {
      accounts,
    };
  }),

  setDefault: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const foundAccount = await ctx.db.query.account.findFirst({
        where: (table, { eq }) => eq(table.accountId, input.accountId),
      });

      if (!foundAccount) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      await ctx.db
        .update(user)
        .set({ defaultAccountId: input.accountId })
        .where(eq(user.id, ctx.user.id));
    }),

  getDefault: protectedProcedure.query(async ({ ctx }) => {
    const account = await getActiveAccount(ctx.user, ctx.headers);
    return { account };
  }),

  delete: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        providerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await auth.api.unlinkAccount({
        body: {
          accountId: input.accountId,
          providerId: input.providerId,
        },
        headers: ctx.headers,
      });

      const activeAccount = await getActiveAccount(ctx.user, ctx.headers);
      if (activeAccount.accountId === input.accountId) {
        await ctx.db
          .update(user)
          .set({ defaultAccountId: null })
          .where(eq(user.id, ctx.user.id));
      }
    }),
});
