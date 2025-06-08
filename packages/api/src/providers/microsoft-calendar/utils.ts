import type {
  Calendar as MicrosoftCalendar,
  Event as MicrosoftEvent,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import { CreateEventInput, UpdateEventInput } from "../../schemas/events";
import type { Calendar, CalendarEvent } from "../interfaces";

export function toMicrosoftDate(
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
) {
  if (value instanceof Temporal.PlainDate) {
    return {
      dateTime: value.toString(),
      timeZone: "UTC",
    };
  }

  if (value instanceof Temporal.Instant) {
    // TODO: might cause issues copying events from other providers
    throw new Error("Temporal.Instant is not supported");
  }

  return {
    dateTime: value.toInstant().toString(),
    timeZone: value.timeZoneId,
  };
}

function parseDate(date: string) {
  return Temporal.PlainDate.from(date);
}

function parseDateTime(dateTime: string, timeZone: string) {
  const instant = Temporal.Instant.from(dateTime);

  return instant.toZonedDateTimeISO(timeZone);
}

export function parseMicrosoftEvent(event: MicrosoftEvent): CalendarEvent {
  const { start, end, isAllDay } = event;

  if (!start || !end || !isAllDay) {
    throw new Error("Event start or end is missing");
  }

  return {
    id: event.id!,
    title: event.subject!,
    description: (event.body?.content as string) ?? event.bodyPreview,
    start: isAllDay
      ? parseDate(start.dateTime!)
      : parseDateTime(start.dateTime!, start.timeZone!),
    end: isAllDay
      ? parseDate(end.dateTime!)
      : parseDateTime(end.dateTime!, end.timeZone!),
    allDay: isAllDay,
    location: event.location?.displayName ?? undefined,
    status: event.showAs || undefined,
    url: event.webLink || undefined,
    color: undefined,
    providerId: "microsoft",
    accountId: "",
    calendarId: "",
  };
}

export function toMicrosoftEvent(event: CreateEventInput | UpdateEventInput) {
  return {
    subject: event.title,
    body: event.description
      ? { contentType: "text", content: event.description }
      : undefined,
    start: toMicrosoftDate(event.start),
    end: toMicrosoftDate(event.end),
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
  };
}

export function calendarPath(calendarId: string) {
  return calendarId === "primary"
    ? "/me/calendar"
    : `/me/calendars/${calendarId}`;
}
