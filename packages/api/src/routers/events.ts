import { TRPCError } from "@trpc/server";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod";

import { toInstant } from "@repo/temporal";

import {
  createEventInputSchema,
  updateEventInputSchema,
} from "../schemas/events";
import { calendarProcedure, createTRPCRouter } from "../trpc";

export const eventsRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z.object({
        calendarIds: z.array(z.string()).default([]),
        timeMin: zZonedDateTimeInstance,
        timeMax: zZonedDateTimeInstance,
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const allEvents = await Promise.allSettled(
          ctx.providers.map(async ({ client, account }) => {
            try {
              const calendars = await client.calendars();

              const requestedCalendars =
                input.calendarIds.length === 0
                  ? calendars
                  : calendars.filter((cal) => input.calendarIds.includes(cal.id));

              const providerEvents = await Promise.allSettled(
                requestedCalendars.map(async (calendar) => {
                  try {
                    const events = await client.events(
                      calendar.id,
                      input.timeMin,
                      input.timeMax,
                    );

                    return events.map((event) => ({
                      ...event,
                      calendarId: calendar.id,
                      providerId: account.providerId,
                      accountId: account.id,
                      color: calendar.color,
                    }));
                  } catch (error) {
                    console.error(`Failed to fetch events for calendar ${calendar.id}:`, error);
                    return []; // Return empty array for failed calendars
                  }
                }),
              );

              // Flatten successful results
              return providerEvents
                .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
                .flatMap(result => result.value);
            } catch (error) {
              console.error(`Failed to fetch calendars for provider ${account.providerId}:`, error);
              return []; // Return empty array for failed providers
            }
          }),
        );

        // Flatten successful results from all providers
        const events = allEvents
          .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
          .flatMap(result => result.value)
          .map(
            (v) => [v, toInstant({ value: v.start, timeZone: "UTC" })] as const,
          )
          .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
          .map(([v]) => v);

        return { events };
      } catch (error) {
        console.error("Failed to fetch events:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch events from calendar providers",
        });
      }
    }),

  create: calendarProcedure
    .input(createEventInputSchema)
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.id === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const event = await provider.client.createEvent(input.calendarId, {
        ...input,
      });

      return { event };
    }),
  update: calendarProcedure
    .input(updateEventInputSchema)
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.id === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const event = await provider.client.updateEvent(
        input.calendarId,
        input.id,
        input,
      );

      return { event };
    }),
  delete: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.id === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      await provider.client.deleteEvent(input.calendarId, input.eventId);

      return { success: true };
    }),
});
