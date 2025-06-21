import { TRPCError } from "@trpc/server";
import { Temporal } from "temporal-polyfill";
import { zZonedDateTimeInstance } from "temporal-zod";
import { z } from "zod";

import { formatToNormalizedDate, toInstant } from "@repo/temporal";

import {
  createEventInputSchema,
  updateEventInputSchema,
} from "../schemas/events";
import { notificationCreateRequest } from "../schemas/notification";
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
            }),
          );

          return providerEvents.flat();
        }),
      );

      const events = allEvents
        .flat()
        .map(
          (v) => [v, toInstant({ value: v.start, timeZone: "UTC" })] as const,
        )
        .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
        .map(([v]) => v);

      return { events };
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

      if (event) {
        const formattedStartDate = formatToNormalizedDate(event.start, "UTC");
        const notificationPayload: z.infer<typeof notificationCreateRequest> = {
          body: `Event "${event.title}" is scheduled for ${formattedStartDate}.${event.location ? ` Location: ${event.location}` : ""}`,
          title: `${event.allDay ? "(All Day)" : ""} New Event: ${event.title}`,
          type: "event_creation",
          sourceId: event.providerId,
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

      const oldEvent = await provider.client.event(input.calendarId, input.id);
      if (!oldEvent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Event not found for calendarId: ${input.calendarId} and eventId: ${input.id}`,
        });
      }

      const event = await provider.client.updateEvent(
        input.calendarId,
        input.id,
        input,
      );

      if (oldEvent.title !== event.title) {
        const notificationPayload: z.infer<typeof notificationCreateRequest> = {
          body: `Event "${oldEvent.title}" has been renamed to "${event.title}"`,
          title: "Event has been updated",
          type: "event_update",
          sourceId: event.providerId,
          eventId: event.id,
        };
        notificationProvider.createAndSendNotification(
          notificationPayload,
          ctx.user.id,
        );
      } else {
        const formattedStartDate = formatToNormalizedDate(event.start, "UTC");
        const notificationPayload: z.infer<typeof notificationCreateRequest> = {
          body: `Event "${event.title}" has been rescheduled to ${formattedStartDate}.${event.location ? ` Location: ${event.location}` : ""}`,
          title: `Rescheduled: ${event.title} to ${formattedStartDate}`,
          type: "event_reschedule",
          sourceId: event.providerId,
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
      const provider = ctx.providers.find(
        ({ account }) => account.id === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Calendar client not found for accountId: ${input.accountId}`,
        });
      }
      provider.client.event(input.calendarId, input.eventId).then((event) => {
        if (event) {
          const notificationPayload: z.infer<typeof notificationCreateRequest> =
            {
              body: `Event "${event.title}" has been cancelled`,
              title: "Event has been cancelled",
              type: "event_cancellation",
              sourceId: event.providerId,
              eventId: event.id,
            };
          notificationProvider.createAndSendNotification(
            notificationPayload,
            ctx.user.id,
          );
        }
      });

      await provider.client.deleteEvent(input.calendarId, input.eventId);

      return { success: true };
    }),
});
