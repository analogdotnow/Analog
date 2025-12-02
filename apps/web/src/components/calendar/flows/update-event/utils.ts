import { Temporal } from "temporal-polyfill";

import type { CalendarEvent } from "@/lib/interfaces";
import { isUserOnlyAttendee } from "@/lib/utils/events";

function isStartDateTimeEqual(
  event: CalendarEvent,
  masterEvent: CalendarEvent,
) {
  if (
    event.start instanceof Temporal.ZonedDateTime &&
    masterEvent.start instanceof Temporal.ZonedDateTime
  ) {
    return Temporal.ZonedDateTime.compare(event.start, masterEvent.start) === 0;
  }

  if (
    event.start instanceof Temporal.Instant &&
    masterEvent.start instanceof Temporal.Instant
  ) {
    return Temporal.Instant.compare(event.start, masterEvent.start) === 0;
  }

  if (
    event.start instanceof Temporal.PlainDate &&
    masterEvent.start instanceof Temporal.PlainDate
  ) {
    return Temporal.PlainDate.compare(event.start, masterEvent.start) === 0;
  }

  return false;
}

export function isFirstInstance(
  event: CalendarEvent,
  masterEvent: CalendarEvent,
) {
  if (event.recurringEventId !== masterEvent.id) {
    return false;
  }

  return isStartDateTimeEqual(event, masterEvent);
}

export function isMovedBetweenCalendars(
  updated: CalendarEvent,
  previous: CalendarEvent,
) {
  return (
    updated.calendar.provider.accountId !==
      previous.calendar.provider.accountId ||
    updated.calendar.id !== previous.calendar.id
  );
}

export function requiresAttendeeConfirmation(event: CalendarEvent) {
  return !!event.attendees && !isUserOnlyAttendee(event.attendees);
}

export function requiresRecurrenceConfirmation(event: CalendarEvent) {
  return !!event.recurringEventId;
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
      ...(isCalendarChanged
        ? {
            calendar: previous.calendar,
          }
        : {}),
      ...(options.sendUpdate
        ? {
            response: {
              status: event.response?.status ?? "unknown",
              sendUpdate: options.sendUpdate,
            },
          }
        : {}),
    },
    ...(isCalendarChanged
      ? {
          move: {
            source: previous.calendar,
            destination: event.calendar,
          },
        }
      : {}),
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
      ...(isCalendarChanged
        ? {
            calendar: previous.calendar,
          }
        : {}),
      ...(options.sendUpdate
        ? {
            response: {
              status: event.response?.status ?? "unknown",
              sendUpdate: options.sendUpdate,
            },
          }
        : {}),
      id: event.recurringEventId!,
      recurringEventId: undefined,
    },
    ...(isCalendarChanged
      ? {
          move: {
            source: previous.calendar,
            destination: event.calendar,
          },
        }
      : {}),
  };
}
