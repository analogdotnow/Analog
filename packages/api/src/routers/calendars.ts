import { TRPCError } from "@trpc/server";
import { z } from "zod/v3";

import {
  calendarProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const calendarsRouter = createTRPCRouter({
  list: calendarProcedure.query(async ({ ctx }) => {
    const promises = ctx.providers.map(async ({ client, account }) => {
      const calendars = await client.calendars();

      return {
        id: account.id,
        providerAccountId: account.accountId,
        providerId: account.providerId,
        name: account.email,
        calendars: calendars.map((calendar) => ({
          ...calendar,
        })),
      };
    });

    const accounts = await Promise.all(promises);

    const defaultAccount =
      ctx.accounts.find(
        (account) => account.id === ctx.user.defaultAccountId,
      ) ?? ctx.accounts.at(0)!;

    const calendars = accounts.flatMap((account) => account.calendars);

    const defaultCalendar =
      calendars.find(
        (calendar) => calendar.id === ctx.user.defaultCalendarId,
      ) ??
      calendars.find(
        (calendar) =>
          calendar.accountId === defaultAccount.accountId && calendar.primary,
      );

    if (!defaultCalendar) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Default calendar not found",
      });
    }

    return {
      defaultCalendar,
      defaultAccount,
      accounts,
    };
  }),
  getDefault: protectedProcedure.query(async ({ ctx }) => {
    return {
      defaultCalendarId: ctx.user.defaultCalendarId ?? null,
    };
  }),
  setDefault: calendarProcedure
    .input(
      z.object({
        calendarId: z.string(),
        accountId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = ctx.providers.find(
        (provider) => provider.account.id === input.accountId,
      );

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }

      const calendars = await account.client.calendars();
      const calendar = calendars.find(
        (calendar) => calendar.id === input.calendarId,
      );

      if (!calendar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Calendar not found",
        });
      }

      await ctx.authContext.internalAdapter.updateUser(ctx.user.id, {
        defaultCalendarId: calendar.id,
        defaultAccountId: input.accountId,
      });
    }),
});
