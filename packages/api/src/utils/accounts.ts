import "server-only";
import { auth, type Session } from "@repo/auth/server";
import { db } from "@repo/db";

export const getActiveAccount = async (
  user: Session["user"],
  headers: Headers,
) => {
  if (user?.id) {
    const activeAccount = await db.query.account.findFirst({
      where: (table, { eq, and }) =>
        and(
          eq(table.userId, user.id),
          eq(table.id, user.id as string),
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
};

export const getAccounts = async (user: Session["user"], headers: Headers) => {
  console.log(`[getAccounts] Getting accounts for user ${user.id}`);
  
  try {
    const _accounts = await db.query.account.findMany({
      where: (table, { eq }) => eq(table.userId, user.id),
    });

    console.log(`[getAccounts] Found ${_accounts.length} accounts in database`);

    const accounts = await Promise.all(
      _accounts.map(async (account, index) => {
        try {
          console.log(`[getAccounts] Getting access token for account ${index + 1}/${_accounts.length}: ${account.id}`);
          
          // Add timeout to access token fetch
          const accessTokenPromise = auth.api.getAccessToken({
            body: {
              providerId: account.providerId,
              accountId: account.id,
              userId: account.userId,
            },
            headers,
          });
          
          const { accessToken } = await Promise.race([
            accessTokenPromise,
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Access token fetch timed out for account ${account.id}`)), 10000)
            ),
          ]);

          return {
            ...account,
            accessToken: accessToken ?? account.accessToken,
          };
        } catch (error) {
          console.error(`[getAccounts] Error getting access token for account ${account.id}:`, error);
          // Return account without refreshed token instead of throwing
          return {
            ...account,
            accessToken: account.accessToken, // Use existing token
          };
        }
      }),
    );

    const validAccounts = accounts.filter(
      (account) => account.accessToken && account.refreshToken,
    );

    console.log(`[getAccounts] Returning ${validAccounts.length} valid accounts`);
    return validAccounts;
  } catch (error) {
    console.error(`[getAccounts] Fatal error:`, error);
    throw error;
  }
};
