import type { EventDateTime } from "@analog/google-calendar";
import { Temporal } from "temporal-polyfill";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
} from "../../../interfaces";
import { parseTextRecurrence } from "../../../lib/recurrences/parse";
import { parseConference } from "../conferences";
import type {
  GoogleCalendarDate,
  GoogleCalendarDateTime,
  GoogleCalendarEvent,
  GoogleCalendarEventAttendee,
  GoogleCalendarEventAttendeeResponseStatus,
} from "../interfaces";

const GMT_OFFSET =
  /^GMT(?<sign>[+-])(?<hours>\d{1,2})(?::?(?<minutes>[0-5]\d))?$/;

function parseTimeZone(timeZone: string) {
  // Normalize Google-style GMT offsets to IANA or UTC-compatible time zones
  if (!timeZone) {
    return timeZone;
  }

  if (timeZone === "GMT") {
    return "UTC";
  }

  const match = GMT_OFFSET.exec(timeZone);

  if (!match?.groups) {
    return timeZone;
  }

  const { sign, hours, minutes } = match.groups;

  if (!sign || !hours) {
    return timeZone;
  }

  // If minutes are provided and not 00, fall back to a UTC offset which Temporal supports.
  const hh = hours.padStart(2, "0");
  const mm = minutes && minutes !== "00" ? minutes : "00";

  return `${sign}${hh}:${mm}`;
}

function parseDate({ date }: GoogleCalendarDate) {
  return Temporal.PlainDate.from(date);
}

function parseDateTime({ dateTime, timeZone }: GoogleCalendarDateTime) {
  const instant = Temporal.Instant.from(dateTime);

  if (!timeZone) {
    return instant;
  }

  return instant.toZonedDateTimeISO(parseTimeZone(timeZone));
}

export function parseEventDate(value: EventDateTime) {
  if (value.date) {
    return parseDate({ date: value.date });
  }

  return parseDateTime({
    dateTime: value.dateTime!,
    timeZone: value.timeZone,
  });
}

interface ParseEventOptions {
  calendar: Calendar;
  event: GoogleCalendarEvent;
  defaultTimeZone?: string;
}

function parseStart(event: GoogleCalendarEvent) {
  if (!event.start?.dateTime) {
    return parseDate(event.start as GoogleCalendarDate);
  }

  return parseDateTime(event.start as GoogleCalendarDateTime);
}

function parseEnd(event: GoogleCalendarEvent) {
  if (!event.start?.dateTime) {
    return parseDate(event.end as GoogleCalendarDate);
  }

  return parseDateTime(event.end as GoogleCalendarDateTime);
}

function parseAttendees(event: GoogleCalendarEvent) {
  if (!event.attendees) {
    return [];
  }

  const attendees = event.attendees.map(parseAttendee);
  const organizer = attendees.find((attendee) => attendee.organizer);

  if (!organizer) {
    return attendees;
  }

  if (attendees[0] === organizer) {
    return attendees;
  }

  return [organizer, ...attendees.filter((attendee) => attendee !== organizer)];
}

function parseResponse(event: GoogleCalendarEvent) {
  const selfAttendee = event.attendees?.find((a) => a.self);

  if (!selfAttendee) {
    return {};
  }

  return {
    response: {
      status: parseAttendeeStatus(selfAttendee.responseStatus ?? "needsAction"),
      comment: selfAttendee.comment,
    },
  };
}

function parseEventRecurrence(
  event: GoogleCalendarEvent,
  defaultTimeZone: string,
) {
  const recurrence = event.recurrence
    ? parseTextRecurrence({
        lines: event.recurrence,
        defaultTimeZone: parseTimeZone(
          event.start?.timeZone ?? defaultTimeZone,
        ),
      })
    : undefined;

  if (!recurrence) {
    return {};
  }

  return { recurrence };
}

function parseCreatedAt(event: GoogleCalendarEvent) {
  if (!event.created) {
    return {};
  }

  return { createdAt: Temporal.Instant.from(event.created) };
}

function parseUpdatedAt(event: GoogleCalendarEvent) {
  if (!event.updated) {
    return {};
  }

  return { updatedAt: Temporal.Instant.from(event.updated) };
}

function parseMetadata(event: GoogleCalendarEvent) {
  return {
    ...(event.recurrence ? { originalRecurrence: event.recurrence } : {}),
    ...(event.recurringEventId
      ? { recurringEventId: event.recurringEventId }
      : {}),
  };
}

export function parseEvent({
  calendar,
  event,
  defaultTimeZone = "UTC",
}: ParseEventOptions): CalendarEvent {
  return {
    // ID should always be present if not defined Google Calendar will generate one
    id: event.id!,
    title: event.summary!,
    description: event.description,
    start: parseStart(event),
    end: parseEnd(event),
    allDay: !event.start?.dateTime,
    location: event.location,
    status: event.status,
    availability: event.transparency === "transparent" ? "free" : "busy",
    attendees: parseAttendees(event),
    url: event.htmlLink,
    etag: event.etag,
    visibility: event.visibility as
      | "default"
      | "public"
      | "private"
      | "confidential"
      | undefined,
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly:
      calendar.readOnly ||
      [
        "birthday",
        "focusTime",
        "fromGmail",
        "outOfOffice",
        "workingLocation",
      ].includes(event.eventType ?? ""),
    conference: parseConference(event),
    ...parseResponse(event),
    ...parseEventRecurrence(event, defaultTimeZone),
    ...parseCreatedAt(event),
    ...parseUpdatedAt(event),
    recurringEventId: event.recurringEventId,
    metadata: parseMetadata(event),
  } as CalendarEvent;
}

function parseAttendeeStatus(
  status: GoogleCalendarEventAttendeeResponseStatus,
): AttendeeStatus {
  if (status === "needsAction") {
    return "unknown";
  }

  return status;
}

function parseAttendeeType(
  attendee: GoogleCalendarEventAttendee,
): "required" | "optional" | "resource" {
  if (attendee.resource) {
    return "resource";
  }

  if (attendee.optional) {
    return "optional";
  }

  return "required";
}

export function parseAttendee(attendee: GoogleCalendarEventAttendee): Attendee {
  return {
    id: attendee.id,
    email: attendee.email!,
    name: attendee.displayName,
    status: parseAttendeeStatus(attendee.responseStatus ?? "needsAction"),
    type: parseAttendeeType(attendee),
    comment: attendee.comment,
    organizer: attendee.organizer,
    additionalGuests: attendee.additionalGuests,
  };
}
