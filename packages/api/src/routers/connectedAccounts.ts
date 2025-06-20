import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getConnectedAccounts } from "../utils/accounts";

export const connectedAccountsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await getConnectedAccounts(ctx.user, ctx.headers);

    return {
      accounts: accounts.map((account) => ({
        id: account.id,
        providerId: account.providerId,
        name: account.name,
        email: account.email,
        image: account.image,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    };
  }),
});
