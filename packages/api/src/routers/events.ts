import { z } from "zod";

import { createTRPCRouter, protectedProcedure, withGoogleCalendar } from "../trpc";
import { dateHelpers } from "../utils/date-helpers";

export const eventsRouter = createTRPCRouter({
  list: protectedProcedure.
  use(withGoogleCalendar)
    .input(
      z.object({
        calendarIds: z.array(z.string()).default([]),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const client = ctx.calendarClient;

      let calendarIds = input.calendarIds;

      if (calendarIds.length === 0) {
        const calendars = await client.calendars();

        calendarIds = calendars
          .filter(
            (cal) =>
              cal.primary || cal.id?.includes("@group.calendar.google.com"),
          )
          .map((cal) => cal.id)
          .filter(Boolean);
      }

      const allEvents = await Promise.all(
        calendarIds.map(async (calendarId) => {
          try {
            return await client.events(
              calendarId,
              input.timeMin,
              input.timeMax,
            );
          } catch (error) {
            console.error(
              `Failed to fetch events for calendar ${calendarId}:`,
              error,
            );
            return [];
          }
        }),
      );

      const events = allEvents
        .flat()
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        );

      return { events };
    }),

  create: protectedProcedure.use(withGoogleCalendar)
    .input(
      z.object({
        calendarId: z.string(),
        title: z.string(),
        start: z.string(),
        end: z.string(),
        allDay: z.boolean().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = ctx.calendarClient;

      const googleParams = dateHelpers.prepareGoogleParams(input);
      const event = await client.createEvent(input.calendarId, googleParams);
      return { event };
    }),

  update: protectedProcedure.use(withGoogleCalendar)
    .input(
      z.object({
        calendarId: z.string(),
        eventId: z.string(),
        title: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        allDay: z.boolean().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = ctx.calendarClient;

      const googleParams = dateHelpers.prepareGoogleParams(input);
      const event = await client.updateEvent(
        input.calendarId,
        input.eventId,
        googleParams,
      );

      return { event };
    }),

  delete: protectedProcedure.use(withGoogleCalendar)
    .input(
      z.object({
        calendarId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = ctx.calendarClient;

      await client.deleteEvent(input.calendarId, input.eventId);
      return { success: true };
    }),
});
