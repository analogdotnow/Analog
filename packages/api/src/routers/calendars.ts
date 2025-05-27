import { createTRPCRouter, protectedProcedure, withGoogleCalendar } from "../trpc";

export const calendarsRouter = createTRPCRouter({
  list: protectedProcedure.use(withGoogleCalendar).query(async ({ ctx }) => {
    const client = ctx.calendarClient;

    const calendars = await client.calendars();

    return {
      accounts: [
        {
          id: "1",
          provider: "google",
          name: ctx.user.email,
          calendars,
        },
      ],
    };
  }),
});
