import type {
  Attendee as MicrosoftEventAttendee,
  Event as MicrosoftEvent,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
} from "../../../interfaces";
import { parseConference } from "../conferences";
import { parseRecurrence } from "../recurrence/parse";
import { parseDateTime, parseTimeZone } from "../utils";

function parseDate(date: string) {
  return Temporal.PlainDate.from(date);
}

interface ParseEventOptions {
  calendar: Calendar;
  event: MicrosoftEvent;
}

function parseStart(event: MicrosoftEvent) {
  if (event.isAllDay) {
    return parseDate(event.start.dateTime);
  }

  return parseDateTime(event.start.dateTime, event.start.timeZone);
}

function parseEnd(event: MicrosoftEvent) {
  if (event.isAllDay) {
    return parseDate(event.end.dateTime);
  }

  return parseDateTime(event.end.dateTime, event.end.timeZone);
}

function parseVisibility(
  sensitivity: MicrosoftEvent["sensitivity"],
): CalendarEvent["visibility"] {
  if (sensitivity === "normal") return "default";
  if (sensitivity === "personal") return "private";
  return sensitivity;
}

function parseAttendees(event: MicrosoftEvent) {
  return event.attendees?.map(parseAttendee) ?? [];
}

function parseResponseStatus(
  event: MicrosoftEvent,
): AttendeeStatus | undefined {
  return event.responseStatus?.response
    ? parseAttendeeStatus(event.responseStatus.response)
    : undefined;
}

function parseResponse(event: MicrosoftEvent) {
  const status = parseResponseStatus(event);

  if (!status) {
    return {};
  }

  return { response: { status } };
}

function parseCreatedAt(event: MicrosoftEvent) {
  if (!event.createdDateTime) {
    return {};
  }

  return { createdAt: Temporal.Instant.from(event.createdDateTime) };
}

function parseUpdatedAt(event: MicrosoftEvent) {
  if (!event.lastModifiedDateTime) {
    return {};
  }

  return { updatedAt: Temporal.Instant.from(event.lastModifiedDateTime) };
}

function parseOriginalStartTimeZone(event: MicrosoftEvent) {
  if (!event.originalStartTimeZone) {
    return {};
  }

  return {
    originalStartTimeZone: {
      raw: event.originalStartTimeZone,
      parsed: parseTimeZone(event.originalStartTimeZone),
    },
  };
}

function parseOriginalEndTimeZone(event: MicrosoftEvent) {
  if (!event.originalEndTimeZone) {
    return {};
  }

  return {
    originalEndTimeZone: {
      raw: event.originalEndTimeZone,
      parsed: parseTimeZone(event.originalEndTimeZone),
    },
  };
}

function parseRecurrenceTimeZone(event: MicrosoftEvent) {
  if (!event.recurrence?.range.recurrenceTimeZone) {
    return {};
  }

  return { recurrenceTimeZone: event.recurrence.range.recurrenceTimeZone };
}

function parseEventRecurrence(event: MicrosoftEvent) {
  const recurrence = event.recurrence
    ? parseRecurrence(event.recurrence)
    : undefined;

  if (!recurrence) {
    return {};
  }

  return { recurrence };
}

function parseMetadata(event: MicrosoftEvent) {
  return {
    ...parseOriginalStartTimeZone(event),
    ...parseOriginalEndTimeZone(event),
    onlineMeeting: event.onlineMeeting,
    ...parseRecurrenceTimeZone(event),
  };
}

export function parseEvent({
  calendar,
  event,
}: ParseEventOptions): CalendarEvent {
  return {
    id: event.id!,
    title: event.subject!,
    description: event.body?.content ?? undefined,
    start: parseStart(event),
    end: parseEnd(event),
    allDay: event.isAllDay ?? false,
    location: event.location?.displayName ?? undefined,
    availability: event.showAs === "free" ? "free" : "busy",
    visibility: parseVisibility(event.sensitivity),
    attendees: parseAttendees(event),
    url: event.webLink ?? undefined,
    etag: event["@odata.etag"],
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly: calendar.readOnly,
    conference: parseConference(event),
    recurringEventId: event.seriesMasterId ?? undefined,
    ...parseEventRecurrence(event),
    ...parseResponse(event),
    ...parseCreatedAt(event),
    ...parseUpdatedAt(event),
    metadata: parseMetadata(event),
  } as CalendarEvent;
}

function parseAttendeeStatus(
  status: MicrosoftEventAttendeeResponseStatus["response"],
): AttendeeStatus {
  if (status === "notResponded" || status === "none") {
    return "unknown";
  }

  if (status === "accepted" || status === "organizer") {
    return "accepted";
  }

  if (status === "tentativelyAccepted") {
    return "tentative";
  }

  if (status === "declined") {
    return "declined";
  }

  return "unknown";
}

export function parseAttendee(attendee: MicrosoftEventAttendee): Attendee {
  return {
    email: attendee.emailAddress.address!,
    name: attendee.emailAddress.name ?? undefined,
    status: parseAttendeeStatus(attendee.status?.response),
    type: attendee.type!,
  };
}
