import { TRPCError } from "@trpc/server";
import * as z from "zod";

import { auth } from "@repo/auth/server";
import { assignColor } from "@repo/providers/calendars/colors";
import { createCalendarInputSchema } from "@repo/schemas";

import {
  calendarProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "../trpc";

export const calendarsRouter = createTRPCRouter({
  create: calendarProcedure
    .input(createCalendarInputSchema)
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const calendar = await provider.client.createCalendar(input);

      return { calendar };
    }),
  sync: calendarProcedure.query(async ({ ctx }) => {
    const promises = ctx.providers.map(async ({ client }) => {
      return client.calendars();
    });

    const results = await Promise.all(promises);

    return results.flat();
  }),
  list: calendarProcedure.query(async ({ ctx }) => {
    const promises = ctx.providers.map(async ({ client, account }) => {
      const calendars = await client.calendars();

      return {
        id: account.id,
        providerAccountId: account.accountId,
        providerId: account.providerId,
        name: account.email,
        calendars,
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
          calendar.providerAccountId === defaultAccount.accountId &&
          calendar.primary,
      );

    // Sort calendars within each account: primary first, then alphabetical by name
    const sortedAccounts = accounts.map((account) => ({
      ...account,
      calendars: account.calendars
        .sort((a, b) => {
          // Primary calendars come first
          if (a.primary && !b.primary) return -1;
          if (!a.primary && b.primary) return 1;

          // Otherwise maintain alphabetical order by name
          return a.name.localeCompare(b.name);
        })
        .map((calendar, index) => ({
          ...calendar,
          color: assignColor(index),
        })),
    }));

    if (!defaultCalendar) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Default calendar not found",
      });
    }

    return {
      defaultCalendar,
      defaultAccount,
      accounts: sortedAccounts,
    };
  }),
  update: calendarProcedure
    .input(
      z.object({
        id: z.string(),
        accountId: z.string(),
        name: z.string(),
        timeZone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const calendars = await provider.client.calendars();
      const calendar = calendars.find((c) => c.id === input.id);

      if (!calendar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar not found for id: ${input.id}`,
        });
      }

      if (calendar.readOnly) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot update a read-only calendar",
        });
      }

      const updated = await provider.client.updateCalendar(input.id, {
        name: input.name,
        timeZone: input.timeZone,
      });

      return { calendar: updated };
    }),
  delete: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const calendars = await provider.client.calendars();
      const calendar = calendars.find((c) => c.id === input.calendarId);

      if (!calendar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar not found for id: ${input.calendarId}`,
        });
      }

      if (calendar.readOnly) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete a read-only calendar",
        });
      }

      await provider.client.deleteCalendar(input.calendarId);

      return { success: true };
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

      const authContext = await auth.$context;

      await authContext.internalAdapter.updateUser(ctx.user.id, {
        defaultCalendarId: calendar.id,
        defaultAccountId: input.accountId,
      });
    }),
});
