import { TRPCError } from "@trpc/server";

import { auth } from "@repo/auth/server";

import { GoogleCalendarProvider } from "../providers/google-calendar";
import {
  activeProviderProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const calendarsRouter = createTRPCRouter({
  list: activeProviderProcedure.query(async ({ ctx }) => {
    const calendars = await ctx.calendarClient.calendars();

    console.log({ calendars });

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
