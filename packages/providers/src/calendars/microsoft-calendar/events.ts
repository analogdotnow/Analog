import type {
  Event as MicrosoftEvent,
  Attendee as MicrosoftEventAttendee,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import type {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventInput,
} from "@repo/schemas";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
} from "../../interfaces";
import {
  parseMicrosoftConference,
  toMicrosoftConferenceData,
} from "./conferences";
import { parseDateTime, parseTimeZone } from "./utils";

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

function parseDate(date: string) {
  return Temporal.PlainDate.from(date);
}

interface ParseMicrosoftEventOptions {
  calendar: Calendar;
  event: MicrosoftEvent;
}

function parseResponseStatus(
  event: MicrosoftEvent,
): AttendeeStatus | undefined {
  const organizerIsAttendee =
    event.attendees?.some(
      (attendee) => attendee.status?.response === "organizer",
    ) ?? false;

  if (
    !event.attendees ||
    !organizerIsAttendee ||
    event.attendees.length === 0
  ) {
    return undefined;
  }

  const hasOtherAttendees = organizerIsAttendee && event.attendees.length > 1;

  if (!hasOtherAttendees) {
    return undefined;
  }

  return event.responseStatus?.response
    ? parseMicrosoftAttendeeStatus(event.responseStatus.response)
    : undefined;
}

export function parseMicrosoftEvent({
  calendar,
  event,
}: ParseMicrosoftEventOptions): CalendarEvent {
  const { start, end, isAllDay } = event;

  if (!start || !end) {
    throw new Error("Event start or end is missing");
  }

  const responseStatus = parseResponseStatus(event);

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
    availability: event.showAs === "free" ? "free" : "busy",
    attendees: event.attendees?.map(parseMicrosoftAttendee) ?? [],
    url: event.webLink ?? undefined,
    // @ts-expect-error -- type from Graph API package is incorrect
    etag: event["@odata.etag"],
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly: calendar.readOnly,
    conference: parseMicrosoftConference(event),
    ...(responseStatus ? { response: { status: responseStatus } } : {}),
    ...(event.createdDateTime
      ? { createdAt: Temporal.Instant.from(event.createdDateTime) }
      : {}),
    ...(event.lastModifiedDateTime
      ? { updatedAt: Temporal.Instant.from(event.lastModifiedDateTime) }
      : {}),
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
      onlineMeeting: event.onlineMeeting,
    },
  } as CalendarEvent;
}

export function toMicrosoftEvent(
  event: CreateEventInput | UpdateEventInput,
): MicrosoftEvent {
  const metadata = event.metadata as MicrosoftEventMetadata | undefined | null;

  return {
    subject: event.title,
    ...(event.description
      ? {
          body: { contentType: "text", content: event.description },
        }
      : {}),
    start: toMicrosoftDate({
      value: event.start,
      originalTimeZone: metadata?.originalStartTimeZone,
    }),
    end: toMicrosoftDate({
      value: event.end,
      originalTimeZone: metadata?.originalEndTimeZone,
    }),
    isAllDay: event.allDay ?? false,
    ...(event.location ? { location: { displayName: event.location } } : {}),
    ...(event.conference ? toMicrosoftConferenceData(event.conference) : {}),
    showAs: event.availability,
  };
}

export function eventResponseStatusPath(
  status: "accepted" | "tentative" | "declined",
): "accept" | "tentativelyAccept" | "decline" {
  if (status === "accepted") {
    return `accept`;
  }

  if (status === "tentative") {
    return `tentativelyAccept`;
  }

  if (status === "declined") {
    return `decline`;
  }

  throw new Error("Invalid status");
}

function parseMicrosoftAttendeeStatus(
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

export function parseMicrosoftAttendee(
  attendee: MicrosoftEventAttendee,
): Attendee {
  return {
    email: attendee.emailAddress!.address!,
    name: attendee.emailAddress?.name ?? undefined,
    status: parseMicrosoftAttendeeStatus(attendee.status?.response),
    type: attendee.type!,
  };
}
