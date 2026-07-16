import type {
  Attendee as MicrosoftEventAttendee,
  Event as MicrosoftEvent,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventPatch,
} from "@repo/schemas";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
} from "../../../interfaces";
import { parseDateTime, parseTimeZone, toMicrosoftDate } from "../utils";
import {
  parseMicrosoftConference,
  toMicrosoftConferenceData,
} from "./conferences/utils";

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
    etag: event["@odata.etag"],
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly: calendar.readOnly,
    conference: parseMicrosoftConference(event),
    recurringEventId: event.seriesMasterId ?? undefined,
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

export function toMicrosoftEvent(event: CreateEventInput): MicrosoftEvent {
  const metadata = toMicrosoftMetadata(event.metadata);

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

function toMicrosoftMetadata(
  metadata: CreateEventInput["metadata"],
): MicrosoftEventMetadata {
  if (!metadata) return {};
  if ("originalStartTimeZone" in metadata) return metadata;
  if ("originalEndTimeZone" in metadata) return metadata;
  if ("onlineMeeting" in metadata) return metadata;
  return {};
}

export function toMicrosoftEventPatch(event: UpdateEventPatch): MicrosoftEvent {
  const metadata = toMicrosoftMetadata(event.metadata);

  return {
    ...(event.title !== undefined ? { subject: event.title } : {}),
    ...(event.description !== undefined
      ? {
          body: { contentType: "text", content: event.description ?? "" },
        }
      : {}),
    ...(event.start !== undefined
      ? {
          start: toMicrosoftDate({
            value: event.start,
            originalTimeZone: metadata?.originalStartTimeZone,
          }),
        }
      : {}),
    ...(event.end !== undefined
      ? {
          end: toMicrosoftDate({
            value: event.end,
            originalTimeZone: metadata?.originalEndTimeZone,
          }),
        }
      : {}),
    ...(event.allDay !== undefined ? { isAllDay: event.allDay } : {}),
    ...(event.location !== undefined
      ? { location: { displayName: event.location } }
      : {}),
    ...(event.availability !== undefined ? { showAs: event.availability } : {}),
    ...(event.conference ? toMicrosoftConferenceData(event.conference) : {}),
  };
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
