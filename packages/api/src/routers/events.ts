import { z } from "zod";

import { activeProviderProcedure, createTRPCRouter } from "../trpc";
import { dateHelpers } from "../utils/date-helpers";

export const eventsRouter = createTRPCRouter({
  list: activeProviderProcedure
    .input(
      z.object({
        calendarIds: z.array(z.string()).default([]),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let calendarIds = input.calendarIds;

      if (calendarIds.length === 0) {
        const calendars = await ctx.calendarClient.calendars();

        calendarIds = calendars
          // .filter(
          //   (cal) =>
          //     cal.primary || cal.id?.includes("@group.calendar.google.com"),
          // )
          .map((cal) => cal.id)
          .filter(Boolean);
      }

      const allEvents = await Promise.all(
        calendarIds.map(async (calendarId) => {
          try {
            const events = await ctx.calendarClient.events(
              calendarId,
              input.timeMin,
              input.timeMax,
            );
            return events.map((event) => ({ ...event, calendarId }));
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

  create: activeProviderProcedure
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
      const event = await ctx.calendarClient.createEvent(
        input.calendarId,
        input,
      );

      return { event };
    }),

  update: activeProviderProcedure
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
      const paramsPreparers = {
        google: dateHelpers.prepareGoogleParams,
        microsoft: dateHelpers.prepareMicrosoftParams,
      } as const;

      const prepareParams = paramsPreparers[ctx.calendarClient.providerId];
      
      const params = prepareParams(input);
      const event = await ctx.calendarClient.updateEvent(
        input.calendarId,
        input.eventId,
        params,
      );

      return { event };
    }),

  delete: activeProviderProcedure
    .input(
      z.object({
        calendarId: z.string(),
        eventId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.calendarClient.deleteEvent(input.calendarId, input.eventId);
      return { success: true };
    }),
});
