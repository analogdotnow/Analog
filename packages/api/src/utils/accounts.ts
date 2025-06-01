import "server-only";
import { cache } from "react";

import { auth, type Session } from "@repo/auth/server";
import { db } from "@repo/db";

export const getActiveAccount = cache(
  async (user: Session["user"], headers: Headers) => {
    if (user?.defaultAccountId) {
      const activeAccount = await db.query.account.findFirst({
        where: (table, { eq, and }) =>
          and(
            eq(table.userId, user.id),
            eq(table.id, user.defaultAccountId as string),
          ),
      });

      if (activeAccount) {
        const { accessToken } = await auth.api.getAccessToken({
          body: {
            providerId: activeAccount?.providerId,
            accountId: activeAccount?.id,
            userId: activeAccount?.userId,
          },
          headers,
        });

        return {
          ...activeAccount,
          accessToken: accessToken ?? activeAccount.accessToken,
        };
      }
    }

    const firstAccount = await db.query.account.findFirst({
      where: (table, { eq }) => eq(table.userId, user.id),
    });

    if (!firstAccount) {
      throw new Error("No account found");
    }

    return firstAccount;
  },
);

export const getAllAccounts = cache(
  async (user: Session["user"], headers: Headers) => {
    const _accounts = await db.query.account.findMany({
      where: (table, { eq }) => eq(table.userId, user.id),
    });

    const accounts = await Promise.all(
      _accounts.map(async (account) => {
        console.log("fetching...", account.id, account.providerId, user.id);

        const { accessToken } = await auth.api.getAccessToken({
          body: {
            providerId: account.providerId,
            accountId: account.id,
            userId: account.userId,
          },
          headers,
        });

        return {
          ...account,
          accessToken: accessToken ?? account.accessToken,
        };
      }),
    );

    return accounts.filter(
      (account) => account.accessToken && account.refreshToken,
    );
  },
);
