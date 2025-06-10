import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { notificationProvider } from "../providers/notification";
import { dateInputSchema } from "../providers/validations";
import { notificationCreateRequest } from "../schemas/notification";
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
        ctx.allCalendarClients.map(async ({ client, account }) => {
          let calendarIds = input.calendarIds;

          if (calendarIds.length === 0) {
            try {
              const calendars = await client.calendars();
              // we will filter out calendars in future with custom filters
              // for all of the providers
              calendarIds = calendars
                // .filter(
                //   (cal) =>
                //     cal.primary || cal.id?.includes("@group.calendar.google.com"),
                // )
                .map((cal) => cal.id)
                .filter(Boolean);
            } catch (error) {
              console.error(
                `Failed to fetch calendars for provider ${account.providerId}:`,
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
                  providerId: account.providerId,
                  accountId: account.accountId,
                }));
              } catch (error) {
                console.error(
                  `Failed to fetch events for calendar ${calendarId} from ${account.providerId}:`,
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
          (a, b) =>
            new Date(a.start.dateTime).getTime() -
            new Date(b.start.dateTime).getTime(),
        );

      return { events };
    }),

  create: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        title: z.string(),
        start: dateInputSchema,
        end: dateInputSchema,
        allDay: z.boolean().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const calendarClient = ctx.allCalendarClients.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!calendarClient) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const { ...eventData } = input;

      const event = await calendarClient.client.createEvent(
        eventData.calendarId,
        eventData,
      );

      if (event) {
        const date = dateHelpers.prepareCreateNotificationParams({
          start: event.start.dateTime,
          end: event.end.dateTime,
          isAllDay: event.allDay,
        });
        const notificationPayload: z.infer<typeof notificationCreateRequest> = {
          body: `Event "${event.title}" is scheduled at ${date}.${event.location ? ` Location: ${event.location}` : ""}`,
          title: "New event added",
          type: "event_creation",
          sourceId: calendarClient.account.providerId,
          eventId: event.id,
        };
        notificationProvider.createAndSendNotification(
          notificationPayload,
          ctx.user.id,
        );
      }

      return { event };
    }),

  update: calendarProcedure
    .input(
      z.object({
        accountId: z.string(),
        calendarId: z.string(),
        eventId: z.string(),
        title: z.string().optional(),
        start: dateInputSchema.optional(),
        end: dateInputSchema.optional(),
        allDay: z.boolean().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const calendarClient = ctx.allCalendarClients.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!calendarClient?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }

      const oldEvent = await calendarClient.client.event(
        input.calendarId,
        input.eventId,
      );
      if (!oldEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Event not found for calendarId: ${input.calendarId} and eventId: ${input.eventId}`,
        });
      }

      const { calendarId, eventId, ...updateData } = input;

      const event = await calendarClient.client.updateEvent(
        calendarId,
        eventId,
        updateData,
      );

      if (oldEvent.title !== event.title) {
        const notificationPayload: z.infer<typeof notificationCreateRequest> = {
          body: `Event "${oldEvent.title}" has been rename to "${input.title}"`,
          title: "Event has been updated",
          type: "event_update",
          sourceId: calendarClient.account.providerId,
          eventId: event.id,
        };
        notificationProvider.createAndSendNotification(
          notificationPayload,
          ctx.user.id,
        );
      } else {
        const date = dateHelpers.prepareCreateNotificationParams({
          start: event.start.dateTime,
          end: event.end.dateTime,
          isAllDay: event.allDay,
        });
        const notificationPayload: z.infer<typeof notificationCreateRequest> = {
          body: `Event "${event.title}" has been rescheduled to ${date}.${event.location ? ` Location: ${event.location}` : ""}`,
          title: "Event has been rescheduled",
          type: "event_reschedule",
          sourceId: calendarClient.account.providerId,
          eventId: event.id,
        };
        notificationProvider.createAndSendNotification(
          notificationPayload,
          ctx.user.id,
        );
      }

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
      const calendarClient = ctx.allCalendarClients.find(
        ({ account }) => account.accountId === input.accountId,
      );

      if (!calendarClient?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }
      calendarClient.client
        .event(input.calendarId, input.eventId)
        .then((event) => {
          if (event) {
            const notificationPayload: z.infer<
              typeof notificationCreateRequest
            > = {
              body: `Event "${event.title}" has been cancelled`,
              title: "Event has been cancelled",
              type: "event_cancellation",
              sourceId: calendarClient.account.providerId,
              eventId: event.id,
            };
            notificationProvider.createAndSendNotification(
              notificationPayload,
              ctx.user.id,
            );
          }
        });

      await calendarClient.client.deleteEvent(input.calendarId, input.eventId);
      return { success: true };
    }),
});
