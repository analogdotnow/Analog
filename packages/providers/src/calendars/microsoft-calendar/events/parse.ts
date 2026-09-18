import type {
  Attendee as MicrosoftEventAttendee,
  Event as MicrosoftEvent,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type { MicrosoftEventMetadata } from "@repo/schemas";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  MicrosoftCalendarEvent,
} from "../../../interfaces";
import { parseConference } from "../conferences";
import { parseRecurrence } from "../recurrence/parse";
import { parseDateTime, parseTimeZone } from "../utils";

function parseDate(date: string) {
  return Temporal.PlainDate.from(date);
}

interface ParseEventOptions {
  calendar: Calendar;
  event: MicrosoftEvent & { "@odata.etag"?: string };
}

function parseTime(event: MicrosoftEvent):
  | {
      allDay: true;
      start: Temporal.PlainDate;
      end: Temporal.PlainDate;
    }
  | {
      allDay: false;
      start: Temporal.ZonedDateTime;
      end: Temporal.ZonedDateTime;
    } {
  if (event.isAllDay) {
    return {
      allDay: true,
      start: parseDate(event.start.dateTime),
      end: parseDate(event.end.dateTime),
    };
  }

  return {
    allDay: false,
    start: parseDateTime(event.start.dateTime, event.start.timeZone),
    end: parseDateTime(event.end.dateTime, event.end.timeZone),
  };
}

function parseVisibility(
  sensitivity: MicrosoftEvent["sensitivity"],
): MicrosoftCalendarEvent["visibility"] {
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

// Graph returns onlineMeeting: null on non-Teams events, and null fails the
// microsoft branch of the metadata schema union — keep the key absent and
// carry only schema-known fields so the round-tripped metadata validates.
function parseOnlineMeeting(event: MicrosoftEvent) {
  if (!event.onlineMeeting) {
    return {};
  }

  const phones = event.onlineMeeting.phones?.filter(
    (phone) => phone.number && phone.type,
  );
  const tollFreeNumbers = event.onlineMeeting.tollFreeNumbers?.filter(
    (number) => number !== null,
  );

  return {
    onlineMeeting: {
      ...(event.onlineMeeting.conferenceId
        ? { conferenceId: event.onlineMeeting.conferenceId }
        : {}),
      ...(event.onlineMeeting.joinUrl
        ? { joinUrl: event.onlineMeeting.joinUrl }
        : {}),
      ...(phones?.length
        ? {
            phones: phones.map((phone) => ({
              number: phone.number,
              type: phone.type,
            })),
          }
        : {}),
      ...(event.onlineMeeting.quickDial
        ? { quickDial: event.onlineMeeting.quickDial }
        : {}),
      ...(tollFreeNumbers?.length ? { tollFreeNumbers } : {}),
      ...(event.onlineMeeting.tollNumber
        ? { tollNumber: event.onlineMeeting.tollNumber }
        : {}),
    },
  };
}

function parseMetadata(event: MicrosoftEvent): MicrosoftEventMetadata {
  return {
    ...parseOriginalStartTimeZone(event),
    ...parseOriginalEndTimeZone(event),
    ...parseOnlineMeeting(event),
    ...parseRecurrenceTimeZone(event),
  };
}

export function parseEvent({
  calendar,
  event,
}: ParseEventOptions): MicrosoftCalendarEvent {
  return {
    id: event.id!,
    title: event.subject!,
    description: event.body?.content ?? undefined,
    ...parseTime(event),
    location: event.location?.displayName ?? undefined,
    availability: event.showAs === "free" ? "free" : "busy",
    visibility: parseVisibility(event.sensitivity),
    attendees: parseAttendees(event),
    url: event.webLink ?? undefined,
    etag: event["@odata.etag"],
    calendar: {
      id: calendar.id,
      provider: {
        id: "microsoft",
        accountId: calendar.provider.accountId,
      },
    },
    readOnly: calendar.readOnly,
    conference: parseConference(event),
    recurringEventId: event.seriesMasterId ?? undefined,
    ...parseEventRecurrence(event),
    ...parseResponse(event),
    ...parseCreatedAt(event),
    ...parseUpdatedAt(event),
    metadata: parseMetadata(event),
  };
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
    email: attendee.emailAddress?.address ?? undefined,
    name: attendee.emailAddress?.name ?? undefined,
    status: parseAttendeeStatus(attendee.status?.response),
    type: attendee.type!,
  };
}
