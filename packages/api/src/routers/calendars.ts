import { calendarProcedure, createTRPCRouter } from "../trpc";

export const calendarsRouter = createTRPCRouter({
  list: calendarProcedure.query(async ({ ctx }) => {
    const accounts = await Promise.all(
      ctx.allCalendarClients.map(async ({ client, account }) => {
        const calendars = await client.calendars();

        return {
          id: account.accountId,
          provider: account.providerId,
          name: account.email,
          calendars,
        };
      }),
    );

    return {
      accounts,
    };
  }),
});
