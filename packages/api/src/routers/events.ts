import { TRPCError } from "@trpc/server";
import * as R from "remeda";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import * as z from "zod";

import { CalendarEvent } from "@repo/providers/interfaces";
import {
  createEventInputSchema,
  eventCalendarSchema,
  providerSchema,
  updateEventInputSchema,
} from "@repo/schemas";
import { toInstant } from "@repo/temporal";

import { calendarProcedure, createTRPCRouter } from "../trpc";
import { findCalendarOrThrow, findProviderOrThrow } from "../utils";

export const eventsRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z.object({
        calendarIds: z.array(z.string()).default([]),
        timeMin: zZonedDateTimeInstance,
        timeMax: zZonedDateTimeInstance,
        defaultTimeZone: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await Promise.all(
        ctx.providers.map(async ({ client }) => {
          const calendars = await client.calendars();

          const requestedCalendars =
            input.calendarIds.length === 0
              ? calendars
              : calendars.filter((cal) => input.calendarIds.includes(cal.id));

          const providerEvents = await Promise.all(
            requestedCalendars.map(async (calendar) => {
              const { events, recurringMasterEvents } = await client.events(
                calendar,
                input.timeMin,
                input.timeMax,
                input.defaultTimeZone,
              );

              return {
                events,
                recurringMasterEvents: Object.values(recurringMasterEvents),
              };
            }),
          );

          return providerEvents.flat();
        }),
      );

      const s = results.flat();
      const allRecurringMasterEvents = s
        .map((e) => e.recurringMasterEvents)
        .flat();

      const recurringMasterEvents: Record<string, CalendarEvent> = R.mergeAll(
        allRecurringMasterEvents.map((e) => ({ [e.id]: e })),
      );

      const events: CalendarEvent[] = s
        .map((e) => e.events)
        .flat()
        .map((v) => [v, toInstant(v.start, { timeZone: "UTC" })] as const)
        .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
        .map(([v]) => v);

      return { events, recurringMasterEvents };
    }),
  sync: calendarProcedure
    .input(
      z.object({
        timeMin: zZonedDateTimeInstance.optional(),
        timeMax: zZonedDateTimeInstance.optional(),
        calendar: eventCalendarSchema.extend({
          syncToken: z.string().optional(),
        }),
        timeZone: z.string().default("UTC"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) =>
          account.accountId === input.calendar.provider.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for providerAccountId: ${input.calendar.provider.accountId}`,
        });
      }

      const calendars = await provider.client.calendars();

      const calendar = calendars.find((c) => c.id === input.calendar.id);

      if (!calendar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar not found: ${input.calendar.id}`,
        });
      }

      const { changes, syncToken, status } = await provider.client.sync({
        calendar,
        initialSyncToken: input.calendar.syncToken,
        timeMin: input.timeMin,
        timeMax: input.timeMax,
        timeZone: input.timeZone,
      });

      return {
        status,
        changes,
        syncToken,
      };
    }),
  get: calendarProcedure
    .input(
      z.object({
        calendar: eventCalendarSchema,
        eventId: z.string(),
        timeZone: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) =>
          account.accountId === input.calendar.provider.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for providerAccountId: ${input.calendar.provider.accountId}`,
        });
      }

      const calendars = await provider.client.calendars();

      const calendar = calendars.find((c) => c.id === input.calendar.id);

      if (!calendar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar not found: ${input.calendar.id}`,
        });
      }

      const event = await provider.client.event(
        calendar,
        input.eventId,
        input.timeZone,
      );

      return { event };
    }),
  create: calendarProcedure
    .input(createEventInputSchema)
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) =>
          account.accountId === input.calendar.provider.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for providerAccountId: ${input.calendar.provider.accountId}`,
        });
      }

      const calendars = await provider.client.calendars();

      const calendar = calendars.find((c) => c.id === input.calendar.id);

      if (!calendar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar not found: ${input.calendar.id}`,
        });
      }

      const event = await provider.client.createEvent(calendar, input);

      return { event };
    }),
  update: calendarProcedure
    .input(
      z.object({
        data: updateEventInputSchema,
        move: z
          .object({
            source: eventCalendarSchema,
            destination: eventCalendarSchema,
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, move } = input;

      // If no move provided, perform a regular update on the current calendar
      if (!move) {
        const provider = ctx.providers.find(
          ({ account }) =>
            account.accountId === data.calendar.provider.accountId,
        );

        if (!provider?.client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Calendar client not found for providerAccountId: ${data.calendar.provider.accountId}`,
          });
        }

        const calendars = await provider.client.calendars();
        const calendar = calendars.find((c) => c.id === data.calendar.id);

        if (!calendar) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Calendar not found: ${data.calendar.id}`,
          });
        }

        const event = await provider.client.updateEvent(
          calendar,
          data.id,
          data,
        );

        return { event };
      }

      // With move provided, move the event first, then apply updates if needed
      const sourceProvider = findProviderOrThrow(
        ctx.providers,
        move.source.provider.accountId,
      );

      const destinationProvider = findProviderOrThrow(
        ctx.providers,
        move.destination.provider.accountId,
      );

      const [sourceCalendars, destinationCalendars] = await Promise.all([
        sourceProvider.client.calendars(),
        destinationProvider.client.calendars(),
      ]);

      const sourceCalendar = findCalendarOrThrow(sourceCalendars, move.source.id);
      const destinationCalendar = findCalendarOrThrow(
        destinationCalendars,
        move.destination.id,
      );

      // If destination is the same as source, just update
      if (
        move.source.provider.accountId === move.destination.provider.accountId &&
        move.source.id === move.destination.id
      ) {
        const event = await sourceProvider.client.updateEvent(
          sourceCalendar,
          data.id,
          data,
        );
        return { event };
      }

      // Moving is only supported for Google accounts
      if (
        sourceProvider.client.providerId !== "google" ||
        destinationProvider.client.providerId !== "google"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Moving events is only supported for Google accounts",
        });
      }

      // Same Google account → use native move then update
      if (
        move.source.provider.accountId === move.destination.provider.accountId
      ) {
        const moved = await sourceProvider.client.moveEvent(
          sourceCalendar,
          destinationCalendar,
          data.id,
          data.response?.sendUpdate ?? true,
        );

        const updated = await destinationProvider.client.updateEvent(
          destinationCalendar,
          moved.id,
          {
            ...data,
            id: moved.id,
            calendar: move.destination,
          },
        );

        return { event: updated };
      }

      // Different Google accounts → clone then delete
      const created = await destinationProvider.client.createEvent(
        destinationCalendar,
        {
          ...data,
          id: crypto.randomUUID(),
          calendar: {
            id: destinationCalendar.id,
            provider: move.destination.provider,
          },
        },
      );

      await sourceProvider.client.deleteEvent(
        sourceCalendar.id,
        data.id,
        data.response?.sendUpdate ?? true,
      );

      return { event: created };
    }),
  delete: calendarProcedure
    .input(
      z.object({
        calendar: eventCalendarSchema,
        eventId: z.string(),
        sendUpdate: z.boolean().optional().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) =>
          account.accountId === input.calendar.provider.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for providerAccountId: ${input.calendar.provider.accountId}`,
        });
      }

      await provider.client.deleteEvent(
        input.calendar.id,
        input.eventId,
        input.sendUpdate,
      );

      return { success: true };
    }),
  move: calendarProcedure
    .input(
      z.object({
        source: eventCalendarSchema.extend({
          provider: providerSchema.extend({
            id: z.literal("google"),
          }),
        }),
        destination: eventCalendarSchema.extend({
          provider: providerSchema.extend({
            id: z.literal("google"),
          }),
        }),
        eventId: z.string(),
        sendUpdate: z.boolean().optional().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sourceProvider = findProviderOrThrow(
        ctx.providers,
        input.source.provider.accountId,
      );
      const destinationProvider = findProviderOrThrow(
        ctx.providers,
        input.destination.provider.accountId,
      );

      const [sourceCalendars, destinationCalendars] = await Promise.all([
        sourceProvider.client.calendars(),
        destinationProvider.client.calendars(),
      ]);

      const sourceCalendar = findCalendarOrThrow(
        sourceCalendars,
        input.source.id,
      );

      const destinationCalendar = findCalendarOrThrow(
        destinationCalendars,
        input.destination.id,
      );

      // Same Google account → use native move
      if (
        input.source.provider.accountId === input.destination.provider.accountId
      ) {
        const event = await sourceProvider.client.moveEvent(
          sourceCalendar,
          destinationCalendar,
          input.eventId,
          input.sendUpdate,
        );

        return { event };
      }

      // Different Google accounts → clone then delete
      const sourceEvent = await sourceProvider.client.event(
        sourceCalendar,
        input.eventId,
      );

      // TODO: what happens to attendees?
      const created = await destinationProvider.client.createEvent(
        destinationCalendar,
        {
          ...sourceEvent,
          id: crypto.randomUUID(),
          calendar: input.destination,
        },
      );

      await sourceProvider.client.deleteEvent(
        sourceCalendar.id,
        input.eventId,
        input.sendUpdate,
      );

      return { event: created };
    }),
  respondToInvite: calendarProcedure
    .input(
      z.object({
        calendar: eventCalendarSchema,
        eventId: z.string(),
        response: z.object({
          status: z.enum(["accepted", "tentative", "declined", "unknown"]),
          comment: z.string().optional(),
          sendUpdate: z.boolean().default(true),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) =>
          account.accountId === input.calendar.provider.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for providerAccountId: ${input.calendar.provider.accountId}`,
        });
      }

      await provider.client.responseToEvent(
        input.calendar.id,
        input.eventId,
        {
          status: input.response.status,
          comment: input.response.comment,
          sendUpdate: input.response.sendUpdate,
        },
      );

      return { success: true };
    }),
});
