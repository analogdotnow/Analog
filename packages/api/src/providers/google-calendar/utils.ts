import { Temporal } from "temporal-polyfill";
import { GoogleCalendarCalendarListEntry, GoogleCalendarDate, GoogleCalendarDateTime, GoogleCalendarEvent, GoogleCalendarEventCreateParams } from "./interfaces";
import { Calendar, CalendarEvent } from "../interfaces";

function toGoogleCalendarDate(value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime): GoogleCalendarDate | GoogleCalendarDateTime {
  if (value instanceof Temporal.PlainDate) {
    return {
      date: value.toString(),
    };
  }

  if (value instanceof Temporal.Instant) {
    return {
      dateTime: value.toString(),
    };
  }

  return {
    dateTime: value.toInstant().toString(),
    timeZone: value.timeZoneId,
  };
}

function parseDate({ date }: GoogleCalendarDate) {
  return Temporal.PlainDate.from(date);
}

function parseDateTime({ dateTime, timeZone }: GoogleCalendarDateTime) {
  const instant = Temporal.Instant.from(dateTime);
  
  if (!timeZone) {
    return instant;
  }
    
  return instant.toZonedDateTimeISO(timeZone);
}

interface ParsedGoogleCalendarEventOptions {
  calendarId: string;
  connectionId: string;
  event: GoogleCalendarEvent;
}

export function parseGoogleCalendarEvent({ calendarId, connectionId, event }: ParsedGoogleCalendarEventOptions): CalendarEvent {
  const isAllDay = !event.start?.dateTime;

  return {
    // ID should always be present if not defined Google Calendar will generate one
    id: event.id!,
    title: event.summary!,
    description: event.description,
    start: isAllDay ? parseDate(event.start as GoogleCalendarDate) : parseDateTime(event.start as GoogleCalendarDateTime),
    end: isAllDay ? parseDate(event.end as GoogleCalendarDate) : parseDateTime(event.end as GoogleCalendarDateTime),
    allDay: isAllDay,
    location: event.location,
    status: event.status,
    url: event.htmlLink,

    provider: "google",
    connectionId,
    calendarId,
  };
}

export function toGoogleCalendarEvent(event: CalendarEvent): GoogleCalendarEventCreateParams {
  return {
    id: event.id,
    summary: event.title,
    description: event.description,
    location: event.location,
    start: toGoogleCalendarDate(event.start),
    end: toGoogleCalendarDate(event.end),
  };
}

interface ParsedGoogleCalendarCalendarListEntryOptions {
  connectionId: string;
  entry: GoogleCalendarCalendarListEntry;
}

export function parseGoogleCalendarCalendarListEntry({ connectionId, entry }: ParsedGoogleCalendarCalendarListEntryOptions): Calendar {
  return {
    id: entry.id!,
    name: entry.summaryOverride ?? entry.summary!,
    description: entry.description,
    location: entry.location,
    timeZone: entry.timeZone,
    primary: entry.primary!,
    readOnly: entry.accessRole === "reader",

    provider: "google",
    connectionId,
  };
}