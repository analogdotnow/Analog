import { Temporal } from "temporal-polyfill";

import type { CreateEventInput, UpdateEventInput } from "@repo/schemas";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
  Recurrence,
} from "../../interfaces";
import { toRecurrenceProperties } from "../../lib/utils/recurrences/export";
import { parseTextRecurrence } from "../../lib/utils/recurrences/parse";
import {
  parseGoogleCalendarConferenceData,
  toGoogleCalendarConferenceData,
} from "./conferences";
import type {
  GoogleCalendarDate,
  GoogleCalendarDateTime,
  GoogleCalendarEvent,
  GoogleCalendarEventAttendee,
  GoogleCalendarEventAttendeeResponseStatus,
  GoogleCalendarEventCreateParams,
} from "./interfaces";

export function toGoogleCalendarDate(
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
): GoogleCalendarDate | GoogleCalendarDateTime {
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
    dateTime: value.toString({ timeZoneName: "never", offset: "auto" }),
    timeZone: value.timeZoneId,
  };
}

function parseDate({ date }: GoogleCalendarDate) {
  return Temporal.PlainDate.from(date);
}

function normalizeGoogleTimeZone(timeZone: string) {
  // Normalize Google-style GMT offsets to IANA or UTC-compatible time zones
  if (!timeZone) {
    return timeZone;
  }

  if (timeZone === "GMT") {
    return "UTC";
  }

  const match = /^GMT([+-])(\d{1,2})(?::?([0-5]\d))?$/.exec(timeZone);

  if (!match) {
    return timeZone;
  }

  const [, sign, hoursStr, minutesStr] = match;

  if (!sign || !hoursStr) {
    return timeZone;
  }

  // If minutes are provided and not 00, fall back to a UTC offset which Temporal supports.
  const hh = hoursStr.padStart(2, "0");
  const mm = minutesStr && minutesStr !== "00" ? minutesStr : "00";

  return `${sign}${hh}:${mm}`;
}

function parseDateTime({ dateTime, timeZone }: GoogleCalendarDateTime) {
  const instant = Temporal.Instant.from(dateTime);

  if (!timeZone) {
    return instant;
  }

  const normalized = normalizeGoogleTimeZone(timeZone);
  return instant.toZonedDateTimeISO(normalized);
}

function parseResponseStatus(event: GoogleCalendarEvent) {
  const selfAttendee = event.attendees?.find((a) => a.self);

  if (!selfAttendee) {
    return undefined;
  }

  return {
    status: parseGoogleCalendarAttendeeStatus(
      selfAttendee.responseStatus as GoogleCalendarEventAttendeeResponseStatus,
    ),
    comment: selfAttendee.comment,
  };
}

function parseRecurrence(
  event: GoogleCalendarEvent,
  timeZone: string,
): Recurrence | undefined {
  if (!event.recurrence) {
    return undefined;
  }

  return parseTextRecurrence({
    lines: event.recurrence,
    defaultTimeZone: normalizeGoogleTimeZone(timeZone),
  });
}

interface ParsedGoogleCalendarEventOptions {
  calendar: Calendar;
  accountId: string;
  event: GoogleCalendarEvent;
  defaultTimeZone?: string;
}

export function parseGoogleCalendarEvent({
  calendar,
  accountId,
  event,
  defaultTimeZone = "UTC",
}: ParsedGoogleCalendarEventOptions): CalendarEvent {
  const isAllDay = !event.start?.dateTime;
  const response = parseResponseStatus(event);
  const recurrence = parseRecurrence(
    event,
    event.start?.timeZone ?? defaultTimeZone,
  );

  return {
    // ID should always be present if not defined Google Calendar will generate one
    id: event.id!,
    title: event.summary!,
    description: event.description,
    start: isAllDay
      ? parseDate(event.start as GoogleCalendarDate)
      : parseDateTime(event.start as GoogleCalendarDateTime),
    end: isAllDay
      ? parseDate(event.end as GoogleCalendarDate)
      : parseDateTime(event.end as GoogleCalendarDateTime),
    allDay: isAllDay,
    location: event.location,
    status: event.status,
    availability: event.transparency === "transparent" ? "free" : "busy",
    attendees: event.attendees
      ? parseGoogleCalendarAttendeeList(event.attendees)
      : [],
    url: event.htmlLink,
    etag: event.etag,
    visibility: event.visibility as
      | "default"
      | "public"
      | "private"
      | "confidential"
      | undefined,
    providerId: "google",
    accountId,
    calendarId: calendar.id,
    readOnly:
      calendar.readOnly ||
      ["birthday", "focusTime", "outOfOffice", "workingLocation"].includes(
        event.eventType ?? "",
      ),
    conference: parseGoogleCalendarConferenceData(event),
    ...(response ? { response } : {}),
    ...(recurrence ? { recurrence } : {}),
    ...(event.created
      ? { createdAt: Temporal.Instant.from(event.created) }
      : {}),
    ...(event.updated
      ? { updatedAt: Temporal.Instant.from(event.updated) }
      : {}),
    recurringEventId: event.recurringEventId,
    metadata: {
      ...(event.recurrence ? { originalRecurrence: event.recurrence } : {}),
      ...(event.recurringEventId
        ? { recurringEventId: event.recurringEventId }
        : {}),
    },
  };
}

function toGoogleCalenderResponseStatus(status: AttendeeStatus) {
  if (status === "unknown") {
    return "needsAction";
  }

  return status;
}

export function toGoogleCalendarAttendee(
  attendee: Attendee,
): GoogleCalendarEventAttendee {
  return {
    email: attendee.email,
    displayName: attendee.name,
    ...(attendee.type === "optional" ? { optional: true } : {}),
    ...(attendee.type === "resource" ? { resource: true } : {}),
    responseStatus: toGoogleCalenderResponseStatus(attendee.status),
    comment: attendee.comment,
    additionalGuests: attendee.additionalGuests,
  };
}

function toGoogleCalendarAttendees(
  attendees: Attendee[],
): GoogleCalendarEventAttendee[] {
  return attendees.map(toGoogleCalendarAttendee);
}

function recurrences(event: CreateEventInput | UpdateEventInput) {
  // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
  if (event.recurrence === null) {
    return [];
  }

  if (!event.recurrence) {
    return undefined;
  }

  return toRecurrenceProperties(event.recurrence);
}

function attendees(event: CreateEventInput | UpdateEventInput) {
  if (event.attendees === null) {
    return [];
  }

  if (!event.attendees) {
    return undefined;
  }

  return toGoogleCalendarAttendees(event.attendees);
}

function conference(event: CreateEventInput | UpdateEventInput) {
  if (event.conference === null) {
    return null;
  }

  if (!event.conference) {
    return undefined;
  }

  return toGoogleCalendarConferenceData(event.conference);
}

export function toGoogleCalendarEvent(
  event: CreateEventInput | UpdateEventInput,
): GoogleCalendarEventCreateParams {
  const result: GoogleCalendarEventCreateParams = {
    id: event.id,
    start: toGoogleCalendarDate(event.start),
    end: toGoogleCalendarDate(event.end),
    // Should always be 1 to ensure conference data is retained for all event modification requests.
    conferenceDataVersion: 1,
  };

  // Handle nullable fields - pass null as any to force deletion
  if (event.title !== undefined) {
    result.summary = event.title as any;
  }
  if (event.description !== undefined) {
    result.description = event.description as any;
  }
  if (event.location !== undefined) {
    result.location = event.location as any;
  }
  if (event.visibility !== undefined) {
    result.visibility = event.visibility as any;
  }
  if (event.availability !== undefined) {
    result.transparency = (
      event.availability === null
        ? null
        : event.availability === "free"
          ? "transparent"
          : "opaque"
    ) as any;
  }
  if (event.recurringEventId !== undefined) {
    result.recurringEventId = event.recurringEventId as any;
  }

  const attendeesValue = attendees(event);
  if (attendeesValue !== undefined) {
    result.attendees = attendeesValue as any;
  }

  const conferenceValue = conference(event);
  if (conferenceValue !== undefined) {
    result.conferenceData = conferenceValue as any;
  }

  const recurrenceValue = recurrences(event);
  if (recurrenceValue !== undefined) {
    result.recurrence = recurrenceValue as any;
  }

  return result;
}

export function toGoogleCalendarAttendeeResponseStatus(
  status: AttendeeStatus,
): GoogleCalendarEventAttendeeResponseStatus {
  if (status === "unknown") {
    return "needsAction";
  }

  return status;
}

function parseGoogleCalendarAttendeeStatus(
  status: GoogleCalendarEventAttendeeResponseStatus,
): AttendeeStatus {
  if (status === "needsAction") {
    return "unknown";
  }

  return status;
}

function parseGoogleCalendarAttendeeType(
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

export function parseGoogleCalendarAttendee(
  attendee: GoogleCalendarEventAttendee,
): Attendee {
  return {
    id: attendee.id,
    email: attendee.email!,
    name: attendee.displayName,
    status: parseGoogleCalendarAttendeeStatus(
      attendee.responseStatus as GoogleCalendarEventAttendeeResponseStatus,
    ),
    type: parseGoogleCalendarAttendeeType(attendee),
    comment: attendee.comment,
    organizer: attendee.organizer,
    additionalGuests: attendee.additionalGuests,
  };
}

export function parseGoogleCalendarAttendeeList(
  attendees: GoogleCalendarEventAttendee[],
): Attendee[] {
  const mappedAttendees = attendees.map(parseGoogleCalendarAttendee);

  // Find the organizer and move to index 0 if it exists
  const organizerIndex = mappedAttendees.findIndex(
    (attendee) => attendee.organizer,
  );

  if (organizerIndex > 0) {
    const organizer = mappedAttendees[organizerIndex]!;

    mappedAttendees.splice(organizerIndex, 1);
    mappedAttendees.unshift(organizer);
  }

  return mappedAttendees;
}
