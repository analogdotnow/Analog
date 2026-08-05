import type {
  ConferenceDataInput,
  EventAttendee,
  EventAttendeeInput,
  EventDateTime,
  EventInput,
} from "@analog/google-calendar";
import { Temporal } from "temporal-polyfill";

import type { CreateEventInput, UpdateEventPatch } from "@repo/schemas";

import type { Attendee, AttendeeStatus } from "../../../interfaces";
import { toRecurrenceProperties } from "../../../lib/recurrences/export";
import { formatConference, formatConferenceInput } from "../conferences";
import type {
  GoogleCalendarDate,
  GoogleCalendarDateTime,
  GoogleCalendarEvent,
  GoogleCalendarEventAttendeeResponseStatus,
} from "../interfaces";

function formatAttendeeInput(attendee: EventAttendee): EventAttendeeInput {
  return {
    additionalGuests: attendee.additionalGuests,
    comment: attendee.comment,
    displayName: attendee.displayName,
    email: attendee.email!,
    optional: attendee.optional,
    resource: attendee.resource,
    responseStatus: attendee.responseStatus,
  };
}

function formatReminders(
  reminders: GoogleCalendarEvent["reminders"],
): EventInput["reminders"] {
  if (!reminders) {
    return undefined;
  }

  return {
    overrides: reminders.overrides?.map((reminder) => ({
      ...reminder,
      method: reminder.method!,
      minutes: reminder.minutes!,
    })),
    useDefault: reminders.useDefault,
  };
}

export function formatEventInput(event: GoogleCalendarEvent) {
  if (event.eventType && event.eventType !== "default") {
    throw new Error(
      `Google Calendar ${event.eventType} events cannot be updated`,
    );
  }

  return {
    anyoneCanAddSelf: event.anyoneCanAddSelf,
    attachments: event.attachments?.map((attachment) => ({
      fileUrl: attachment.fileUrl!,
      iconLink: attachment.iconLink,
      mimeType: attachment.mimeType,
      title: attachment.title,
    })),
    attendees: event.attendees?.map(formatAttendeeInput),
    attendeesOmitted: event.attendeesOmitted,
    conferenceData: formatConferenceInput(event.conferenceData),
    description: event.description,
    end: event.end!,
    eventType: "default" as const,
    extendedProperties: event.extendedProperties,
    guestsCanInviteOthers: event.guestsCanInviteOthers,
    guestsCanModify: event.guestsCanModify,
    guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests,
    location: event.location,
    originalStartTime: event.originalStartTime,
    recurrence: event.recurrence,
    reminders: formatReminders(event.reminders),
    sequence: event.sequence,
    source: event.source,
    start: event.start!,
    status: event.status,
    summary: event.summary,
    transparency: event.transparency,
    visibility: event.visibility,
    ...(event.eventLabelId
      ? { eventLabelId: event.eventLabelId, eventLabelVersion: 1 as const }
      : { colorId: event.colorId }),
  };
}

export function formatDate(
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

export function formatAttendee(attendee: Attendee): EventAttendeeInput {
  return {
    email: attendee.email,
    displayName: attendee.name,
    ...(attendee.type === "optional" ? { optional: true } : {}),
    ...(attendee.type === "resource" ? { resource: true } : {}),
    responseStatus: formatAttendeeStatus(attendee.status),
    comment: attendee.comment,
    additionalGuests: attendee.additionalGuests,
  };
}

function formatRecurrence(event: CreateEventInput | UpdateEventPatch) {
  // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
  if (event.recurrence === null) {
    return [];
  }

  if (!event.recurrence) {
    return undefined;
  }

  return toRecurrenceProperties(event.recurrence);
}

function formatAttendees(event: CreateEventInput | UpdateEventPatch) {
  if (!event.attendees) {
    return undefined;
  }

  return event.attendees.map(formatAttendee);
}

function formatEventConference(event: CreateEventInput | UpdateEventPatch) {
  if (event.conference === null) {
    return null;
  }

  if (!event.conference) {
    return undefined;
  }

  return formatConference(event.conference);
}

function formatTransparency(
  event: CreateEventInput | UpdateEventPatch,
): "opaque" | "transparent" | undefined {
  if (!event.availability) {
    return undefined;
  }

  if (event.availability === "free") {
    return "transparent";
  }

  return "opaque";
}

export function formatEvent(event: CreateEventInput) {
  if (event.color) {
    throw new Error("Google Calendar event colors are not supported");
  }

  return {
    id: event.id,
    summary: event.title,
    description: event.description,
    location: event.location,
    visibility: event.visibility,
    start: formatDate(event.start),
    end: formatDate(event.end),
    transparency: formatTransparency(event),
    attendees: formatAttendees(event),
    conferenceData: event.conference
      ? formatConference(event.conference)
      : undefined,
    // Should always be 1 to ensure conference data is retained for all event modification requests.
    conferenceDataVersion: 1 as const,
    // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
    recurrence: formatRecurrence(event),
  };
}

interface EventUpdateOverrides {
  attendees?: EventAttendeeInput[];
  calendarId: string;
  conferenceData?: ConferenceDataInput | null;
  conferenceDataVersion: 1;
  description?: string | null;
  end: EventDateTime;
  location?: string | null;
  recurrence?: string[];
  start: EventDateTime;
  summary?: string;
  transparency?: "opaque" | "transparent";
  visibility?: "confidential" | "default" | "private" | "public";
}

export function formatEventPatch(
  event: UpdateEventPatch,
  existingEvent: GoogleCalendarEvent,
): EventUpdateOverrides {
  if (event.color) {
    throw new Error("Google Calendar event colors are not supported");
  }

  return {
    calendarId: event.calendar.id,
    // Should always be 1 to ensure conference data is retained for all event modification requests.
    conferenceDataVersion: 1,
    start: event.start ? formatDate(event.start) : existingEvent.start!,
    end: event.end ? formatDate(event.end) : existingEvent.end!,
    // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
    recurrence:
      event.recurrence !== undefined
        ? formatRecurrence(event)
        : existingEvent.recurrence,
    ...(event.title !== undefined ? { summary: event.title } : {}),
    // A null patch value is sent as an explicit null in the PUT body to clear
    // the field (recurrence clears as [] instead — the insert type has no null).
    ...(event.description !== undefined
      ? { description: event.description }
      : {}),
    ...(event.location !== undefined ? { location: event.location } : {}),
    ...(event.visibility !== undefined ? { visibility: event.visibility } : {}),
    ...(event.availability !== undefined
      ? { transparency: formatTransparency(event) }
      : {}),
    ...(event.attendees !== undefined
      ? { attendees: formatAttendees(event) }
      : {}),
    // A "conference"-shaped patch is display-only and maps to no input: skip
    // the key so the echoed conferenceData survives the full-replace PUT.
    ...(event.conference === null || event.conference?.type === "create"
      ? { conferenceData: formatEventConference(event) }
      : {}),
  };
}

export function formatAttendeeStatus(
  status: AttendeeStatus,
): GoogleCalendarEventAttendeeResponseStatus {
  if (status === "unknown") {
    return "needsAction";
  }

  return status;
}

export function attendeesWithSelfResponse(
  attendees: EventAttendee[] | undefined,
  status: AttendeeStatus,
  comment?: string | null,
) {
  if (!attendees) {
    throw new Error("Event has no attendees");
  }

  const attendee = attendees.find((attendee) => attendee.self);

  if (!attendee) {
    throw new Error("User is not an attendee");
  }

  const input = formatAttendeeInput(attendee);

  if (comment === undefined) {
    return [
      {
        ...input,
        responseStatus: formatAttendeeStatus(status),
      },
    ];
  }

  return [
    {
      ...input,
      comment,
      responseStatus: formatAttendeeStatus(status),
    },
  ];
}
