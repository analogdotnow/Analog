import type {
  Calendar as MicrosoftCalendar,
  Event as MicrosoftEvent,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventInput,
} from "../../schemas/events";
import type { Calendar, CalendarEvent } from "../interfaces";
import { mapWindowsToIanaTimeZone } from "./windows-timezones";

interface ToMicrosoftDateOptions {
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  originalTimeZone?: {
    raw: string;
    parsed?: string;
  };
}

export function toMicrosoftDate({
  value,
  originalTimeZone,
}: ToMicrosoftDateOptions) {
  if (value instanceof Temporal.PlainDate) {
    return {
      dateTime: value.toString(),
      timeZone: originalTimeZone?.raw ?? "UTC",
    };
  }

  // These events were created using another provider.
  if (value instanceof Temporal.Instant) {
    const dateTime = value
      .toZonedDateTimeISO("UTC")
      .toPlainDateTime()
      .toString();

    return {
      dateTime,
      timeZone: "UTC",
    };
  }

  return {
    dateTime: value.toInstant().toString(),
    timeZone:
      originalTimeZone?.parsed === value.timeZoneId
        ? originalTimeZone?.raw
        : value.timeZoneId,
  };
}

function isValidTimeZone(tz: string) {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    throw new Error("Time zones are not available in this environment");
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (error: unknown) {
    return false;
  }
}

function parseTimeZone(timeZone: string) {
  if (isValidTimeZone(timeZone)) {
    return timeZone;
  }

  return mapWindowsToIanaTimeZone(timeZone);
}

function parseDate(date: string) {
  return Temporal.PlainDate.from(date);
}

function parseDateTime(dateTime: string, timeZone: string) {
  const dt = Temporal.PlainDateTime.from(dateTime);

  return dt.toZonedDateTime(parseTimeZone(timeZone) ?? "UTC");
}

export function parseMicrosoftEvent(event: MicrosoftEvent): CalendarEvent {
  const { start, end, isAllDay } = event;

  if (!start || !end) {
    throw new Error("Event start or end is missing");
  }

  console.log(
    start.timeZone,
    start.timeZone ? parseTimeZone(start.timeZone) : undefined,
    event.originalStartTimeZone,
    event.originalStartTimeZone
      ? parseTimeZone(event.originalStartTimeZone)
      : undefined,
  );

  return {
    id: event.id!,
    title: event.subject!,
    description: event.bodyPreview ?? undefined,
    start: isAllDay
      ? parseDate(start.dateTime!)
      : parseDateTime(start.dateTime!, start.timeZone!),
    end: isAllDay
      ? parseDate(end.dateTime!)
      : parseDateTime(end.dateTime!, end.timeZone!),
    allDay: isAllDay ?? false,
    location: event.location?.displayName ?? undefined,
    status: event.showAs ?? undefined,
    url: event.webLink ?? undefined,
    color: undefined,
    providerId: "microsoft",
    accountId: "",
    calendarId: "",
    metadata: {
      ...(event.originalStartTimeZone
        ? {
            originalStartTimeZone: {
              raw: event.originalStartTimeZone,
              parsed: event.originalStartTimeZone
                ? parseTimeZone(event.originalStartTimeZone)
                : undefined,
            },
          }
        : {}),
      ...(event.originalEndTimeZone
        ? {
            originalEndTimeZone: {
              raw: event.originalEndTimeZone,
              parsed: event.originalEndTimeZone
                ? parseTimeZone(event.originalEndTimeZone)
                : undefined,
            },
          }
        : {}),
    },
  };
}

export function toMicrosoftEvent(event: CreateEventInput | UpdateEventInput) {
  const metadata = event.metadata as MicrosoftEventMetadata | undefined;

  return {
    subject: event.title,
    body: event.description
      ? { contentType: "text", content: event.description }
      : undefined,
    start: toMicrosoftDate({
      value: event.start,
      originalTimeZone: metadata?.originalStartTimeZone,
    }),
    end: toMicrosoftDate({
      value: event.end,
      originalTimeZone: metadata?.originalEndTimeZone,
    }),
    isAllDay: event.allDay ?? false,
    location: event.location ? { displayName: event.location } : undefined,
  };
}

export function parseMicrosoftCalendar(calendar: MicrosoftCalendar): Calendar {
  return {
    id: calendar.id as string,
    providerId: "microsoft",
    name: calendar.name as string,
    primary: calendar.isDefaultCalendar as boolean,
    accountId: "",
    color: calendar.hexColor as string,
  };
}

export function calendarPath(calendarId: string) {
  return calendarId === "primary"
    ? "/me/calendar"
    : `/me/calendars/${calendarId}`;
}
