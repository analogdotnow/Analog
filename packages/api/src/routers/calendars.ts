import { calendarProcedure, createTRPCRouter } from "../trpc";

export const calendarsRouter = createTRPCRouter({
  list: calendarProcedure.query(async ({ ctx }) => {
    try {
      const promises = ctx.providers.map(async ({ client, account }) => {
        try {
          const calendars = await client.calendars();

          return {
            id: account.id,
            providerId: account.providerId,
            name: account.email,
            calendars,
          };
        } catch (error) {
          console.error(`Failed to fetch calendars for provider ${account.providerId}:`, error);
          // Return empty calendars array for failed providers
          return {
            id: account.id,
            providerId: account.providerId,
            name: account.email,
            calendars: [],
          };
        }
      });

      const accounts = await Promise.allSettled(promises);

      // Filter out failed results and flatten successful ones
      const successfulAccounts = accounts
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      return {
        accounts: successfulAccounts,
      };
    } catch (error) {
      console.error("Failed to fetch calendars:", error);
      throw new Error("Failed to fetch calendars from providers");
    }
  }),
});
