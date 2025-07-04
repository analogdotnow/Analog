import { TRPCError } from "@trpc/server";
import { Temporal } from "temporal-polyfill";
import { z } from "zod";

import { accountToConferencingProvider, accountToProvider } from "../providers";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAccounts, getDefaultAccount } from "../utils/accounts";

export const conferencingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        calendarId: z.string().optional(),
        eventId: z.string().optional(),
        accountId: z.string(),
        calendarAccountId: z.string().optional(),
        providerId: z.enum(["google", "zoom", "none"]).default("none"),
        agenda: z.string().default("Meeting"),
        startTime: z.string(),
        endTime: z.string(),
        timeZone: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.providerId === "none") {
        if (input.calendarId && input.eventId && input.accountId) {
          const accounts = await getAccounts(ctx.user, ctx.headers);
          const account = accounts.find((a) => a.id === input.accountId);

          if (account) {
            try {
              const calendarProvider = accountToProvider(account);
              const calendars = await calendarProvider.calendars();
              const calendar = calendars.find((c) => c.id === input.calendarId);

              if (calendar) {
                const startInstant = Temporal.Instant.from(input.startTime);
                const endInstant = Temporal.Instant.from(input.endTime);
                const tz = input.timeZone ?? calendar.timeZone ?? "UTC";

                const start = startInstant.toZonedDateTimeISO(tz);
                const end = endInstant.toZonedDateTimeISO(tz);

                await calendarProvider.updateEvent(calendar, input.eventId, {
                  id: input.eventId,
                  accountId: input.accountId,
                  calendarId: input.calendarId,
                  conferenceData: undefined,
                  start,
                  end,
                });
              }
            } catch {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to remove conference data from event",
              });
            }
          }
        }

        return { conferenceData: null };
      }

      const accounts = await getAccounts(ctx.user, ctx.headers);

      const account = accounts.find(
        (a) => a.id === input.accountId && a.providerId === input.providerId,
      );

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const provider = accountToConferencingProvider(account, input.providerId);

      const conferenceData = await provider.createConferencing(
        input.agenda,
        input.startTime,
        input.endTime,
        input.timeZone,
        input.calendarId,
        input.eventId,
      );

      if (
        input.providerId === "zoom" &&
        input.calendarId &&
        input.eventId &&
        conferenceData
      ) {
        let targetAccountId =
          input.calendarAccountId ?? ctx.user.defaultAccountId;

        if (!targetAccountId) {
          targetAccountId = accounts.find((a) => a.providerId !== "zoom")?.id;
        }

        if (!targetAccountId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No calendar account found",
          });
        }

        const calendarAccount = accounts.find((a) => a.id === targetAccountId);

        if (!calendarAccount) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Calendar account not found",
          });
        }

        const calendarProvider = accountToProvider(calendarAccount);
        const calendars = await calendarProvider.calendars();
        const calendar = calendars.find((c) => c.id === input.calendarId);

        if (!calendar) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Calendar not found",
          });
        }

        const startInstant = Temporal.Instant.from(input.startTime);
        const endInstant = Temporal.Instant.from(input.endTime);
        const tz = input.timeZone ?? calendar.timeZone ?? "UTC";

        const start = startInstant.toZonedDateTimeISO(tz);
        const end = endInstant.toZonedDateTimeISO(tz);

        try {
          await calendarProvider.updateEvent(calendar, input.eventId, {
            id: input.eventId,
            accountId: calendarAccount.id,
            calendarId: calendar.id,
            conferenceData,
            start,
            end,
          });
        } catch (err) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update event with conference data",
          });
        }
      }

      return { conferenceData };
    }),
});
