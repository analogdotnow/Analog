import type {
  Event as MicrosoftEvent,
  Attendee as MicrosoftEventAttendee,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import type {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventInput,
} from "@repo/schemas";

import type { Attendee, AttendeeStatus } from "../../../interfaces";
import { formatOnlineMeetingProvider } from "../conferences";
import { formatRecurrence } from "../recurrence/format";

interface FormatDateOptions {
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  originalTimeZone?: {
    raw: string;
    parsed?: string;
  };
}

export function formatDate({ value, originalTimeZone }: FormatDateOptions) {
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

function formatBody(event: CreateEventInput | UpdateEventInput) {
  if (!event.description) {
    return undefined;
  }

  return { contentType: "text" as const, content: event.description };
}

function formatStart(event: CreateEventInput | UpdateEventInput) {
  const metadata = event.metadata as MicrosoftEventMetadata | undefined | null;

  return formatDate({
    value: event.start,
    originalTimeZone: metadata?.originalStartTimeZone,
  });
}

function formatEnd(event: CreateEventInput | UpdateEventInput) {
  const metadata = event.metadata as MicrosoftEventMetadata | undefined | null;

  return formatDate({
    value: event.end,
    originalTimeZone: metadata?.originalEndTimeZone,
  });
}

function formatLocation(event: CreateEventInput | UpdateEventInput) {
  if (!event.location) {
    return undefined;
  }

  return { displayName: event.location };
}

function formatAttendees(event: CreateEventInput | UpdateEventInput) {
  if (!event.attendees) {
    return undefined;
  }

  return event.attendees.map(formatAttendee);
}

// map: visibility -> sensitivity
function formatSensitivity(event: CreateEventInput | UpdateEventInput) {
  if (!event.visibility) {
    return undefined;
  }

  switch (event.visibility) {
    case "default":
      return "normal";
    case "public":
      return "normal";
    case "private":
      return "private";
    case "confidential":
      return "confidential";
    default:
      return "normal";
  }
}

function formatAttendeeResponseStatus(status: AttendeeStatus) {
  switch (status) {
    case "unknown":
      return "none";
    case "accepted":
      return "accepted";
    case "tentative":
      return "tentativelyAccepted";
    case "declined":
      return "declined";
    default:
      return "none";
  }
}

function formatAttendee(attendee: Attendee): MicrosoftEventAttendee {
  return {
    emailAddress: {
      address: attendee.email,
      name: attendee.name,
    },
    type: attendee.type,
    status: {
      response: formatAttendeeResponseStatus(attendee.status),
    },
  };
}

export function formatIsOnlineMeeting(
  event: CreateEventInput | UpdateEventInput,
) {
  return event.conference?.type === "create";
}

export function formatEvent(
  event: CreateEventInput | UpdateEventInput,
): MicrosoftEvent {
  return {
    subject: event.title,
    body: formatBody(event),
    start: formatStart(event),
    end: formatEnd(event),
    isAllDay: event.allDay ?? false,
    location: formatLocation(event),
    isOnlineMeeting: formatIsOnlineMeeting(event),
    onlineMeetingProvider: formatOnlineMeetingProvider(event),
    attendees: formatAttendees(event),
    recurrence: formatRecurrence(event),
    sensitivity: formatSensitivity(event),
    showAs: event.availability,
  };
}
