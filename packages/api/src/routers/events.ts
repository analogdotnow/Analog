import { TRPCError } from "@trpc/server";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod/v3";

import { toInstant } from "@repo/temporal";

import { CalendarEvent } from "../interfaces";
import {
  createEventInputSchema,
  updateEventInputSchema,
} from "../schemas/events";
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
      const allEvents = await Promise.all(
        ctx.providers.map(async ({ client, account }) => {
          const calendars = await client.calendars();

          const requestedCalendars =
            input.calendarIds.length === 0
              ? calendars
              : calendars.filter((cal) => input.calendarIds.includes(cal.id));

          const providerEvents = await Promise.all(
            requestedCalendars.map(async (calendar) => {
              const events = await client.events(
                calendar,
                input.timeMin,
                input.timeMax,
                input.defaultTimeZone,
              );

              return events.map((event) => ({
                ...event,
                calendarId: calendar.id,
                providerId: account.providerId,
                accountId: account.accountId,
                providerAccountId: account.accountId,
              }));
            }),
          );

          return providerEvents.flat();
        }),
      );

      const events: CalendarEvent[] = allEvents
        .flat()
        .map((v) => [v, toInstant(v.start, { timeZone: "UTC" })] as const)
        .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
        .map(([v]) => v);

      return { events };
    }),
  get: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
        timeZone: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
          message: `Calendar not found for accountId: ${input.calendarId}`,
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
          message: `Calendar not found for accountId: ${input.calendarId}`,
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
            source: z.object({
              accountId: z.string(),
              calendarId: z.string(),
            }),
            destination: z.object({
              accountId: z.string(),
              calendarId: z.string(),
            }),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, move } = input;

      // If no move provided, perform a regular update on the current calendar
      if (!move) {
        const provider = ctx.providers.find(
          ({ account }) => account.accountId === data.accountId,
        );

        if (!provider?.client) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Calendar client not found for accountId: ${data.accountId}`,
          });
        }

        const calendars = await provider.client.calendars();
        const calendar = calendars.find((c) => c.id === data.calendarId);

        if (!calendar) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Calendar not found for accountId: ${data.accountId}`,
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
        move.source.accountId,
      );
      
      const destinationProvider = findProviderOrThrow(
        ctx.providers,
        move.destination.accountId,
      );

      const [sourceCalendars, destinationCalendars] = await Promise.all([
        sourceProvider.client.calendars(),
        destinationProvider.client.calendars(),
      ]);

      const sourceCalendar = findCalendarOrThrow(
        sourceCalendars,
        move.source.calendarId,
      );
      const destinationCalendar = findCalendarOrThrow(
        destinationCalendars,
        move.destination.calendarId,
      );

      // If destination is the same as source, just update
      if (
        move.source.accountId === move.destination.accountId &&
        move.source.calendarId === move.destination.calendarId
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
      if (move.source.accountId === move.destination.accountId) {
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
            accountId: move.destination.accountId,
            calendarId: move.destination.calendarId,
          },
        );

        return { event: updated };
      }

      console.log("different google accounts", {
        sourceProvider,
        destinationProvider,
        sourceCalendar,
        destinationCalendar,
      });

      // Different Google accounts → clone then delete
      const created = await destinationProvider.client.createEvent(
        destinationCalendar,
        {
          ...data,
          id: crypto.randomUUID(),
          accountId: move.destination.accountId,
          calendarId: destinationCalendar.id,
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
        accountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
        sendUpdate: z.boolean().optional().default(true),
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

      await provider.client.deleteEvent(
        input.calendarId,
        input.eventId,
        input.sendUpdate,
      );

      return { success: true };
    }),
  move: calendarProcedure
    .input(
      z.object({
        source: z.object({
          providerId: z.enum(["google"]),
          accountId: z.string(),
          calendarId: z.string(),
        }),
        destination: z.object({
          providerId: z.enum(["google"]),
          accountId: z.string(),
          calendarId: z.string(),
        }),
        eventId: z.string(),
        sendUpdate: z.boolean().optional().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sourceProvider = findProviderOrThrow(
        ctx.providers,
        input.source.accountId,
      );
      const destinationProvider = findProviderOrThrow(
        ctx.providers,
        input.destination.accountId,
      );

      const [sourceCalendars, destinationCalendars] = await Promise.all([
        sourceProvider.client.calendars(),
        destinationProvider.client.calendars(),
      ]);

      const sourceCalendar = findCalendarOrThrow(
        sourceCalendars,
        input.source.calendarId,
      );

      const destinationCalendar = findCalendarOrThrow(
        destinationCalendars,
        input.destination.calendarId,
      );

      // Same Google account → use native move
      if (input.source.accountId === input.destination.accountId) {
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

      console.log("different google accounts", {
        sourceProvider,
        destinationProvider,
        sourceCalendar,
        destinationCalendar,
      });

      // TODO: what happens to attendees?
      const created = await destinationProvider.client.createEvent(
        destinationCalendar,
        {
          ...sourceEvent,
          id: crypto.randomUUID(),
          accountId: input.destination.accountId,
          calendarId: input.destination.calendarId,
          providerId: "google",
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
        accountId: z.string(),
        calendarId: z.string(),
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
        ({ account }) => account.accountId === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      await provider.client.responseToEvent(input.calendarId, input.eventId, {
        status: input.response.status,
        comment: input.response.comment,
        sendUpdate: input.response.sendUpdate,
      });

      return { success: true };
    }),
});
