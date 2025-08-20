import type { CalendarEvent } from "@/lib/interfaces";
import { isUserOnlyAttendee } from "@/lib/utils/events";

export function isMovedBetweenCalendars(
  updated: CalendarEvent,
  previous: CalendarEvent,
) {
  return (
    updated.accountId !== previous.accountId ||
    updated.calendarId !== previous.calendarId
  );
}

export function requiresAttendeeConfirmation(event: CalendarEvent) {
  return !!event.attendees && !isUserOnlyAttendee(event.attendees);
}

export function requiresRecurrenceConfirmation(event: CalendarEvent) {
  return event.recurringEventId !== undefined;
}

interface BuildUpdateEventOptions {
  sendUpdate?: boolean;
}

export function buildUpdateEvent(
  event: CalendarEvent,
  previous: CalendarEvent,
  options: BuildUpdateEventOptions,
) {
  const isCalendarChanged = isMovedBetweenCalendars(event, previous);

  return {
    data: {
      ...event,
      ...(isCalendarChanged && {
        accountId: previous.accountId,
        calendarId: previous.calendarId,
      }),
      ...(options.sendUpdate && {
        response: {
          status: event.response?.status ?? "unknown",
          sendUpdate: options.sendUpdate,
        },
      }),
    },
    ...(isCalendarChanged && {
      move: {
        source: {
          accountId: previous.accountId,
          calendarId: previous.calendarId,
        },
        destination: {
          accountId: event.accountId,
          calendarId: event.calendarId,
        },
      },
    }),
  };
}

interface BuildUpdateSeriesOptions {
  sendUpdate?: boolean;
}

export function buildUpdateSeries(
  event: CalendarEvent,
  previous: CalendarEvent,
  options: BuildUpdateSeriesOptions,
) {
  const isCalendarChanged = isMovedBetweenCalendars(event, previous);

  return {
    data: {
      ...event,
      ...(isCalendarChanged && {
        accountId: previous.accountId,
        calendarId: previous.calendarId,
      }),
      ...(options.sendUpdate && {
        response: {
          status: event.response?.status ?? "unknown",
          sendUpdate: options.sendUpdate,
        },
      }),
      id: event.recurringEventId!,
      recurringEventId: undefined,
    },
    ...(isCalendarChanged && {
      move: {
        source: {
          accountId: previous.accountId,
          calendarId: previous.calendarId,
        },
        destination: {
          accountId: event.accountId,
          calendarId: event.calendarId,
        },
      },
    }),
  };
}
