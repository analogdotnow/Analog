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

export const eventsRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z
        .object({
          timeMin: zZonedDateTimeInstance,
          timeMax: zZonedDateTimeInstance.optional(),
          defaultTimeZone: z.string(),
          maxResults: z.number().positive().default(500),
        })
        .refine(
          (data) => data.timeMax !== undefined || data.maxResults !== undefined,
          {
            message: "Either timeMax or maxResults must be provided",
            path: ["timeMax"],
          },
        ),
    )
    .query(async ({ ctx, input }) => {
      const allEvents = await Promise.all(
        ctx.providers.map(async ({ client, account }) => {
          const calendars = await client.calendars();

          const providerEvents = await Promise.all(
            calendars.map(async (calendar) => {
              const events = await client.events({
                calendar,
                timeMin: input.timeMin,
                timeMax: input.timeMax,
                timeZone: input.defaultTimeZone,
                maxResults: input.maxResults,
              });

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

      let events: CalendarEvent[] = allEvents
        .flat()
        .map((v) => [v, toInstant(v.start, { timeZone: "UTC" })] as const)
        .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
        .map(([v]) => v);

      // Apply maxResults limit if specified
      if (input.maxResults) {
        events = events.slice(0, input.maxResults);
      }

      return { events };
    }),
  listUpcoming: calendarProcedure
    .input(
      z.object({
        defaultTimeZone: z.string(),
        maxResults: z.number().positive().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = Temporal.Now.zonedDateTimeISO(input.defaultTimeZone);

      const allEvents = await Promise.all(
        ctx.providers.map(async ({ client, account }) => {
          const calendars = await client.calendars();

          const providerEvents = await Promise.all(
            calendars.map(async (calendar) => {
              const events = await client.events({
                calendar,
                timeMin: now,
                timeZone: input.defaultTimeZone,
                maxResults: input.maxResults,
              });

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
    .input(updateEventInputSchema)
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
          message: `Calendar not found for accountId: ${input.accountId}`,
        });
      }

      const event = await provider.client.updateEvent(
        calendar,
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
