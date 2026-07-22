import { Temporal } from "temporal-polyfill";

import type {
  ConferenceDataInput,
  EntryPoint,
  EntryPointInput,
  EventAttendee,
  EventAttendeeInput,
  EventDateTime,
  EventInput,
} from "@analog/google-calendar";
import type { CreateEventInput, UpdateEventPatch } from "@repo/schemas";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
  Recurrence,
} from "../../../interfaces";
import { toRecurrenceProperties } from "../../../lib/recurrences/export";
import { parseTextRecurrence } from "../../../lib/recurrences/parse";
import type {
  GoogleCalendarDate,
  GoogleCalendarDateTime,
  GoogleCalendarEvent,
  GoogleCalendarEventAttendee,
  GoogleCalendarEventAttendeeResponseStatus,
} from "../interfaces";
import { parseConferenceData, toConferenceData } from "./conferences/utils";

function toGoogleCalendarEntryPointInput(
  entryPoint: EntryPoint,
): EntryPointInput {
  return {
    accessCode: entryPoint.accessCode,
    entryPointFeatures: entryPoint.entryPointFeatures,
    entryPointType: entryPoint.entryPointType!,
    label: entryPoint.label,
    meetingCode: entryPoint.meetingCode,
    passcode: entryPoint.passcode,
    password: entryPoint.password,
    pin: entryPoint.pin,
    regionCode: entryPoint.regionCode,
    uri: entryPoint.uri!,
  };
}

function toGoogleCalendarConferenceDataInput(
  conferenceData: GoogleCalendarEvent["conferenceData"],
): ConferenceDataInput | undefined {
  if (!conferenceData) {
    return undefined;
  }

  // A createRequest with status "success" is a completed conference (see
  // isCreatingConferenceRequest in ./conferences/utils.ts), so copy it instead
  // of re-echoing the request.
  if (
    (!conferenceData.createRequest ||
      conferenceData.createRequest.status?.statusCode === "success") &&
    conferenceData.entryPoints?.length
  ) {
    const [entryPoint, ...entryPoints] = conferenceData.entryPoints;

    return {
      ...conferenceData,
      conferenceSolution: {
        iconUri: conferenceData.conferenceSolution?.iconUri,
        key: {
          type: conferenceData.conferenceSolution!.key!.type!,
        },
        name: conferenceData.conferenceSolution?.name,
      },
      entryPoints: [
        toGoogleCalendarEntryPointInput(entryPoint!),
        ...entryPoints.map(toGoogleCalendarEntryPointInput),
      ],
    };
  }

  if (!conferenceData.createRequest) {
    return undefined;
  }

  // Re-sending the same requestId is an idempotent no-op that keeps a
  // conferenceData body present; omitting it would clear the conference
  // because updates always send conferenceDataVersion=1.
  return {
    createRequest: {
      requestId: conferenceData.createRequest.requestId!,
      ...(conferenceData.createRequest.conferenceSolutionKey?.type && {
        conferenceSolutionKey: {
          type: conferenceData.createRequest.conferenceSolutionKey.type,
        },
      }),
    },
  };
}

function toGoogleCalendarAttendeeInput(
  attendee: EventAttendee,
): EventAttendeeInput {
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

function toGoogleCalendarRemindersInput(
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

export function toGoogleCalendarEventInput(event: GoogleCalendarEvent) {
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
    attendees: event.attendees?.map(toGoogleCalendarAttendeeInput),
    attendeesOmitted: event.attendeesOmitted,
    conferenceData: toGoogleCalendarConferenceDataInput(event.conferenceData),
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
    reminders: toGoogleCalendarRemindersInput(event.reminders),
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

export function parseGoogleCalendarEventDate(value: EventDateTime) {
  if (value.date) {
    return parseDate({ date: value.date });
  }

  return parseDateTime({
    dateTime: value.dateTime!,
    timeZone: value.timeZone,
  });
}

function parseResponseStatus(event: GoogleCalendarEvent) {
  const selfAttendee = event.attendees?.find((a) => a.self);

  if (!selfAttendee) {
    return undefined;
  }

  return {
    status: parseGoogleCalendarAttendeeStatus(
      selfAttendee.responseStatus ?? "needsAction",
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
  event: GoogleCalendarEvent;
  defaultTimeZone?: string;
}

export function parseGoogleCalendarEvent({
  calendar,
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
    calendar: {
      id: calendar.id,
      provider: calendar.provider,
    },
    readOnly:
      calendar.readOnly ||
      [
        "birthday",
        "focusTime",
        "fromGmail",
        "outOfOffice",
        "workingLocation",
      ].includes(event.eventType ?? ""),
    conference: parseConferenceData(event),
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
  } as CalendarEvent;
}

export function toGoogleCalendarAttendee(
  attendee: Attendee,
): EventAttendeeInput {
  return {
    email: attendee.email,
    displayName: attendee.name,
    ...(attendee.type === "optional" ? { optional: true } : {}),
    ...(attendee.type === "resource" ? { resource: true } : {}),
    responseStatus: toGoogleCalendarAttendeeResponseStatus(attendee.status),
    comment: attendee.comment,
    additionalGuests: attendee.additionalGuests,
  };
}

function toGoogleCalendarAttendees(
  attendees: Attendee[],
): EventAttendeeInput[] {
  return attendees.map(toGoogleCalendarAttendee);
}

function recurrences(event: CreateEventInput | UpdateEventPatch) {
  // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
  if (event.recurrence === null) {
    return [];
  }

  if (!event.recurrence) {
    return undefined;
  }

  return toRecurrenceProperties(event.recurrence);
}

function attendees(event: CreateEventInput | UpdateEventPatch) {
  if (!event.attendees) {
    return undefined;
  }

  return toGoogleCalendarAttendees(event.attendees);
}

function conference(event: CreateEventInput | UpdateEventPatch) {
  if (event.conference === null) {
    return null;
  }

  if (!event.conference) {
    return undefined;
  }

  return toConferenceData(event.conference);
}

function availability(
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

export function createEventParams(event: CreateEventInput) {
  if (event.color) {
    throw new Error("Google Calendar event colors are not supported");
  }

  return {
    id: event.id,
    summary: event.title,
    description: event.description,
    location: event.location,
    visibility: event.visibility,
    start: toGoogleCalendarDate(event.start),
    end: toGoogleCalendarDate(event.end),
    transparency: availability(event),
    attendees: attendees(event),
    conferenceData: event.conference
      ? toConferenceData(event.conference)
      : undefined,
    // Should always be 1 to ensure conference data is retained for all event modification requests.
    conferenceDataVersion: 1 as const,
    // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
    recurrence: recurrences(event),
  };
}

interface GoogleCalendarEventUpdateOverrides {
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

export function updateEventParams(
  event: UpdateEventPatch,
  existingEvent: GoogleCalendarEvent,
): GoogleCalendarEventUpdateOverrides {
  if (event.color) {
    throw new Error("Google Calendar event colors are not supported");
  }

  return {
    calendarId: event.calendar.id,
    // Should always be 1 to ensure conference data is retained for all event modification requests.
    conferenceDataVersion: 1,
    start: event.start
      ? toGoogleCalendarDate(event.start)
      : existingEvent.start!,
    end: event.end ? toGoogleCalendarDate(event.end) : existingEvent.end!,
    // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
    recurrence:
      event.recurrence !== undefined
        ? recurrences(event)
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
      ? { transparency: availability(event) }
      : {}),
    ...(event.attendees !== undefined ? { attendees: attendees(event) } : {}),
    // A "conference"-shaped patch is display-only and maps to no input: skip
    // the key so the echoed conferenceData survives the full-replace PUT.
    ...(event.conference === null || event.conference?.type === "create"
      ? { conferenceData: conference(event) }
      : {}),
  };
}

export function toGoogleCalendarAttendeeResponseStatus(
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

  const input = toGoogleCalendarAttendeeInput(attendee);

  if (comment === undefined) {
    return [
      {
        ...input,
        responseStatus: toGoogleCalendarAttendeeResponseStatus(status),
      },
    ];
  }

  return [
    {
      ...input,
      comment,
      responseStatus: toGoogleCalendarAttendeeResponseStatus(status),
    },
  ];
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
      attendee.responseStatus ?? "needsAction",
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
