import "server-only";

import { auth, type Account, type User } from "@repo/auth/server";
import { db } from "@repo/db";

async function withAccessToken(account: Account, headers: Headers) {
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
}

export async function getDefaultAccount(user: User, headers: Headers) {
  const defaultAccountId = user.defaultAccountId;

  if (defaultAccountId) {
    const defaultAccount = await db.query.account.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.userId, user.id), eq(table.id, defaultAccountId)),
    });

    return await withAccessToken(defaultAccount!, headers);
  }

  const account = await db.query.account.findFirst({
    where: (table, { eq }) => eq(table.userId, user.id),
    orderBy: (table, { desc }) => desc(table.createdAt),
  });

  const ctx = await auth.$context;
  await ctx.internalAdapter.updateUser(user.id, {
    defaultAccountId: account!.id,
  });

  return await withAccessToken(account!, headers);
}

export async function getAccounts(user: User, headers: Headers) {
  const accounts = await db.query.account.findMany({
    where: (table, { eq }) => eq(table.userId, user.id),
  });

  const promises = accounts.map(async (account) => {
    return await withAccessToken(account, headers);
  });

  return await Promise.all(promises);
}
