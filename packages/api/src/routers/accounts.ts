import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAccounts, getDefaultAccount } from "../utils/accounts";

export const accountsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await getAccounts(ctx.user, ctx.headers);

    return {
      accounts: accounts.map((account) => ({
        id: account.id,
        provider: {
          id: account.providerId,
          accountId: account.accountId,
        },
        name: account.name,
        email: account.email,
        image: account.image,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    };
  }),
  getDefault: protectedProcedure.query(async ({ ctx }) => {
    const account = await getDefaultAccount(ctx.user, ctx.headers);

    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found",
      });
    }

    return {
      account: {
        id: account.id,
        provider: {
          id: account.providerId as "google" | "microsoft",
          accountId: account.accountId,
        },
        name: account.name,
        email: account.email,
        image: account.image,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    };
  }),
});
