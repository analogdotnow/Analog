import { z } from "zod";

import { calendarProcedure, createTRPCRouter } from "../trpc";
import { dateHelpers } from "../utils/date-helpers";

export const eventsRouter = createTRPCRouter({
  list: calendarProcedure
    .input(
      z.object({
        calendarIds: z.array(z.string()).default([]),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allEvents = await Promise.all(
        ctx.allCalendarClients.map(async ({ client, connection }) => {
          let calendarIds = input.calendarIds;

          if (calendarIds.length === 0) {
            try {
              const calendars = await client.calendars();
              calendarIds = calendars
                // .filter(
                //   (cal) =>
                //     cal.primary || cal.id?.includes("@group.calendar.google.com"),
                // )
                .map((cal) => cal.id)
                .filter(Boolean);
            } catch (error) {
              console.error(
                `Failed to fetch calendars for provider ${connection.providerId}:`,
                error,
              );
              return [];
            }
          }

          const providerEvents = await Promise.all(
            calendarIds.map(async (calendarId) => {
              try {
                const events = await client.events(
                  calendarId,
                  input.timeMin,
                  input.timeMax,
                );
                return events.map((event) => ({
                  ...event,
                  calendarId,
                  providerId: connection.providerId,
                  accountId: connection.id,
                  accountName: connection.email,
                }));
              } catch (error) {
                console.error(
                  `Failed to fetch events for calendar ${calendarId} from ${connection.providerId}:`,
                  error,
                );
                return [];
              }
            }),
          );

          return providerEvents.flat();
        }),
      );

      const events = allEvents
        .flat()
        .sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
        );

      return { events };
    }),

  create: calendarProcedure
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

  update: calendarProcedure
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

  delete: calendarProcedure
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
