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

  if (!defaultAccountId) {
    throw new Error("No default account found");
  }

  const defaultAccount = await db.query.account.findFirst({
    where: (table, { eq, and }) =>
      and(eq(table.userId, user.id), eq(table.id, defaultAccountId)),
  });

  if (!defaultAccount) {
    throw new Error("No default account found");
  }

  return await withAccessToken(defaultAccount, headers);
}

export async function getAccounts(user: User, headers: Headers) {
  const accounts = await db.query.account.findMany({
    where: (table, { eq }) => eq(table.userId, user.id),
  });

  const promises = accounts.map(async (account) => {
    return withAccessToken(account, headers);
  });

  return Promise.all(promises);
}
