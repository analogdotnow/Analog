import "server-only";
import { auth, type Session } from "@repo/auth/server";
import { db } from "@repo/db";

export const getActiveAccount = async (
  user: Session["user"],
  headers: Headers,
) => {
  if (user?.defaultAccountId) {
    const activeAccount = await db.query.account.findFirst({
      where: (table, { eq, and }) =>
        and(
          eq(table.userId, user.id),
          eq(table.id, user.defaultAccountId as string),
        ),
    });

    if (activeAccount) {
      try {
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
      } catch (error) {
        console.error(`Failed to get access token for default account ${activeAccount.id}:`, error);
        // Fall through to get first account
      }
    }
  }

  const firstAccount = await db.query.account.findFirst({
    where: (table, { eq }) => eq(table.userId, user.id),
  });

  if (!firstAccount) {
    throw new Error("No account found");
  }

  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: firstAccount.providerId,
        accountId: firstAccount.id,
        userId: firstAccount.userId,
      },
      headers,
    });

    return {
      ...firstAccount,
      accessToken: accessToken ?? firstAccount.accessToken,
    };
  } catch (error) {
    console.error(`Failed to get access token for first account ${firstAccount.id}:`, error);
    // Return the account with the stored access token as fallback
    return {
      ...firstAccount,
      accessToken: firstAccount.accessToken,
    };
  }
};

export const getAccounts = async (user: Session["user"], headers: Headers) => {
  const _accounts = await db.query.account.findMany({
    where: (table, { eq }) => eq(table.userId, user.id),
  });

  const accounts = await Promise.all(
    _accounts.map(async (account) => {
      try {
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
      } catch (error) {
        console.error(`Failed to get access token for account ${account.id}:`, error);
        // Return the account with the stored access token as fallback
        // This allows the account to still be used if the stored token is still valid
        return {
          ...account,
          accessToken: account.accessToken,
        };
      }
    }),
  );

  // Filter out accounts that don't have any access token at all
  return accounts.filter(
    (account) => account.accessToken && account.refreshToken,
  );
};
