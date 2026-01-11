import type {
  Event as MicrosoftEvent,
  Attendee as MicrosoftEventAttendee,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
} from "@microsoft/microsoft-graph-types";
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

interface ParseMicrosoftEventOptions {
  calendar: Calendar;
  event: MicrosoftEvent;
}

function isOrganizer(event: MicrosoftEvent) {
  if (!event.attendees) {
    return false;
  }

  return event.attendees.some(
    (attendee) => attendee.status?.response === "organizer",
  );
}

function hasOtherAttendees(event: MicrosoftEvent) {
  if (!event.attendees || event.attendees.length === 0) {
    return false;
  }

  return isOrganizer(event) && event.attendees.length > 1;
}

function parseResponseStatus(
  event: MicrosoftEvent,
): AttendeeStatus | undefined {
  if (!event.attendees || event.attendees.length === 0) {
    return undefined;
  }

  if (!hasOtherAttendees(event)) {
    return undefined;
  }

  if (!event.responseStatus) {
    return undefined;
  }

  return parseAttendeeStatus(event.responseStatus.response);
}

function parseResponse(event: MicrosoftEvent) {
  const status = parseResponseStatus(event);

  if (!status) {
    return undefined;
  }

  return {
    status,
  };
}

function parseAttendees(event: MicrosoftEvent) {
  return event.attendees?.map(parseAttendee) ?? [];
}

function parseVisibility(event: MicrosoftEvent) {
  if (!event.sensitivity) {
    return undefined;
  }

  switch (event.sensitivity) {
    case "normal":
      return "default";
    case "personal":
      return "private";
    case "private":
      return "private";
    case "confidential":
      return "confidential";
    default:
      return "default";
  }
}

function parseCreatedAt(event: MicrosoftEvent) {
  if (!event.createdDateTime) {
    return undefined;
  }

  return Temporal.Instant.from(event.createdDateTime);
}

function parseUpdatedAt(event: MicrosoftEvent) {
  if (!event.lastModifiedDateTime) {
    return undefined;
  }

  return Temporal.Instant.from(event.lastModifiedDateTime);
}

function parseOriginalStartTimeZone(event: MicrosoftEvent) {
  return {
    raw: event.originalStartTimeZone,
    parsed: event.originalStartTimeZone
      ? parseTimeZone(event.originalStartTimeZone)
      : undefined,
  };
}

function parseOriginalEndTimeZone(event: MicrosoftEvent) {
  return {
    raw: event.originalEndTimeZone,
    parsed: event.originalEndTimeZone
      ? parseTimeZone(event.originalEndTimeZone)
      : undefined,
  };
}

function parseMetadata(event: MicrosoftEvent) {
  return {
    originalStartTimeZone: parseOriginalStartTimeZone(event),
    originalEndTimeZone: parseOriginalEndTimeZone(event),
    onlineMeeting: event.onlineMeeting,
  };
}

function parseStart(event: MicrosoftEvent) {
  if (event.isAllDay) {
    return parseDate(event.start!.dateTime!);
  }

  return parseDateTime(event.start!.dateTime!, event.start!.timeZone!);
}

function parseEnd(event: MicrosoftEvent) {
  if (event.isAllDay) {
    return parseDate(event.end!.dateTime!);
  }

  return parseDateTime(event.end!.dateTime!, event.end!.timeZone!);
}

export function parseEvent({
  calendar,
  event,
}: ParseMicrosoftEventOptions): CalendarEvent {
  return {
    id: event.id!,
    title: event.subject!,
    description: event.bodyPreview ?? undefined,
    start: parseStart(event),
    end: parseEnd(event),
    allDay: event.isAllDay ?? false,
    location: event.location?.displayName ?? undefined,
    availability: event.showAs === "free" ? "free" : "busy",
    attendees: parseAttendees(event),
    url: event.webLink ?? undefined,
    // @ts-expect-error -- type from Graph API package is incorrect
    etag: event["@odata.etag"],
    visibility: parseVisibility(event),
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly: calendar.readOnly,
    conference: parseConference(event),
    response: parseResponse(event),
    recurrence: parseRecurrence(event),
    recurringEventId: event.seriesMasterId ?? undefined,
    createdAt: parseCreatedAt(event),
    updatedAt: parseUpdatedAt(event),
    metadata: parseMetadata(event),
  };
}

function parseAttendeeStatus(
  status: MicrosoftEventAttendeeResponseStatus["response"],
): AttendeeStatus {
  switch (status) {
    case "notResponded":
      return "unknown";
    case "accepted":
      return "accepted";
    case "tentativelyAccepted":
      return "tentative";
    case "declined":
      return "declined";
    default:
      return "unknown";
  }
}

export function parseAttendee(attendee: MicrosoftEventAttendee): Attendee {
  return {
    email: attendee.emailAddress!.address!,
    name: attendee.emailAddress?.name ?? undefined,
    status: parseAttendeeStatus(attendee.status?.response),
    type: attendee.type!,
  };
}
