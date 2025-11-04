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
  accountId: string;
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
  accountId,
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
    providerId: "microsoft",
    accountId,
    calendarId: calendar.id,
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
  };
}

export function toMicrosoftEvent(
  event: CreateEventInput | UpdateEventInput,
): MicrosoftEvent {
  const metadata = event.metadata as MicrosoftEventMetadata | undefined | null;

  const result: MicrosoftEvent = {
    start: toMicrosoftDate({
      value: event.start,
      originalTimeZone: metadata?.originalStartTimeZone,
    }),
    end: toMicrosoftDate({
      value: event.end,
      originalTimeZone: metadata?.originalEndTimeZone,
    }),
    isAllDay: event.allDay ?? false,
  };

  // Handle nullable fields - pass null as any to force deletion
  if (event.title !== undefined) {
    result.subject = event.title as any;
  }
  if (event.description !== undefined) {
    result.body = (
      event.description === null
        ? null
        : { contentType: "text", content: event.description }
    ) as any;
  }
  if (event.location !== undefined) {
    result.location = (
      event.location === null ? null : { displayName: event.location }
    ) as any;
  }
  if (event.allDay !== undefined) {
    result.isAllDay = event.allDay as any;
  }
  if (event.availability !== undefined) {
    result.showAs = event.availability as any;
  }
  if (event.conference !== undefined) {
    if (event.conference === null) {
      result.isOnlineMeeting = null as any;
      result.onlineMeetingProvider = null as any;
    } else {
      const conferenceData = toMicrosoftConferenceData(event.conference);
      Object.assign(result, conferenceData);
    }
  }

  return result;
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
