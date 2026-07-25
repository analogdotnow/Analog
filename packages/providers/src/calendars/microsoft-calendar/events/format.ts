import type {
  Attendee as MicrosoftEventAttendee,
  Event as MicrosoftEvent,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventPatch,
} from "@repo/schemas";

import type { Attendee } from "../../../interfaces";
import { formatConference } from "../conferences";
import { formatRecurrence, formatRecurrencePatch } from "../recurrence/format";

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
      dateTime: value.toPlainDateTime().toString(),
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
    dateTime: value.toPlainDateTime().toString(),
    timeZone:
      originalTimeZone?.parsed === value.timeZoneId
        ? originalTimeZone?.raw
        : value.timeZoneId,
  };
}

function formatMetadata(
  metadata: CreateEventInput["metadata"],
): MicrosoftEventMetadata {
  if (!metadata) return {};
  if ("originalStartTimeZone" in metadata) return metadata;
  if ("originalEndTimeZone" in metadata) return metadata;
  if ("onlineMeeting" in metadata) return metadata;
  if ("recurrenceTimeZone" in metadata) return metadata;
  return {};
}

function formatBody(event: CreateEventInput) {
  if (!event.description) {
    return {};
  }

  return { body: { contentType: "text" as const, content: event.description } };
}

function formatStart(event: CreateEventInput) {
  const metadata = formatMetadata(event.metadata);

  return formatDate({
    value: event.start,
    originalTimeZone: metadata.originalStartTimeZone,
  });
}

function formatEnd(event: CreateEventInput) {
  const metadata = formatMetadata(event.metadata);

  return formatDate({
    value: event.end,
    originalTimeZone: metadata.originalEndTimeZone,
  });
}

function formatLocation(event: CreateEventInput) {
  if (!event.location) {
    return {};
  }

  return { location: { displayName: event.location } };
}

function formatSensitivity(
  visibility: CreateEventInput["visibility"],
): MicrosoftEvent["sensitivity"] {
  if (visibility === "default") return "normal";
  if (visibility === "public") return "normal";
  return visibility;
}

function formatAttendee(attendee: Attendee): MicrosoftEventAttendee {
  return {
    emailAddress: {
      address: attendee.email,
      name: attendee.name,
    },
    type: attendee.type,
  };
}

function formatAttendees(event: CreateEventInput) {
  return event.attendees?.map(formatAttendee);
}

function formatEventRecurrence(event: CreateEventInput) {
  if (!event.recurrence) {
    return {};
  }

  const metadata = formatMetadata(event.metadata);

  return {
    recurrence: formatRecurrence({
      recurrence: event.recurrence,
      start: event.start,
      recurrenceTimeZone: metadata.recurrenceTimeZone,
    }),
  };
}

export function formatEvent(event: CreateEventInput): MicrosoftEvent {
  return {
    subject: event.title,
    ...formatBody(event),
    start: formatStart(event),
    end: formatEnd(event),
    isAllDay: event.allDay ?? false,
    ...formatLocation(event),
    ...(event.conference ? formatConference(event.conference) : {}),
    showAs: event.availability,
    sensitivity: formatSensitivity(event.visibility),
    attendees: formatAttendees(event),
    ...formatEventRecurrence(event),
  };
}

interface FormatEventPatchOptions {
  // Resolved master start for recurrence serialization; Graph requires
  // range.startDate to match the master event's start date, which a sparse
  // patch does not necessarily carry.
  startForRecurrence?:
    | Temporal.PlainDate
    | Temporal.Instant
    | Temporal.ZonedDateTime;
}

export function formatEventPatch(
  event: UpdateEventPatch,
  options: FormatEventPatchOptions = {},
): Partial<MicrosoftEvent> {
  const metadata = formatMetadata(event.metadata);

  return {
    ...(event.title !== undefined ? { subject: event.title } : {}),
    ...(event.description !== undefined
      ? {
          body: {
            contentType: "text" as const,
            content: event.description ?? "",
          },
        }
      : {}),
    ...(event.start !== undefined
      ? {
          start: formatDate({
            value: event.start,
            originalTimeZone: metadata.originalStartTimeZone,
          }),
        }
      : {}),
    ...(event.end !== undefined
      ? {
          end: formatDate({
            value: event.end,
            originalTimeZone: metadata.originalEndTimeZone,
          }),
        }
      : {}),
    ...(event.allDay !== undefined ? { isAllDay: event.allDay } : {}),
    ...(event.location !== undefined
      ? { location: { displayName: event.location } }
      : {}),
    ...(event.availability !== undefined ? { showAs: event.availability } : {}),
    ...(event.visibility !== undefined
      ? { sensitivity: formatSensitivity(event.visibility) }
      : {}),
    ...(event.attendees !== undefined
      ? { attendees: event.attendees.map(formatAttendee) }
      : {}),
    // Graph has no conference field to null out: clearing demotes the online
    // meeting via isOnlineMeeting=false with the provider reset to "unknown".
    ...(event.conference === null
      ? { isOnlineMeeting: false, onlineMeetingProvider: "unknown" as const }
      : event.conference
        ? formatConference(event.conference)
        : {}),
    ...formatRecurrencePatch(
      event.recurrence,
      options.startForRecurrence ?? event.start,
      metadata.recurrenceTimeZone,
    ),
  };
}
