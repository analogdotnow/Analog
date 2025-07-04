import { Temporal } from "temporal-polyfill";

import { CreateEventInput, UpdateEventInput } from "../../schemas/events";
import {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
} from "../interfaces";
import {
  GoogleCalendarCalendarListEntry,
  GoogleCalendarDate,
  GoogleCalendarDateTime,
  GoogleCalendarEvent,
  GoogleCalendarEventAttendee,
  GoogleCalendarEventAttendeeResponseStatus,
  GoogleCalendarEventCreateParams,
} from "./interfaces";

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
    dateTime: value.toInstant().toString(),
    timeZone: value.timeZoneId,
  };
}

function parseDate({ date }: GoogleCalendarDate) {
  return Temporal.PlainDate.from(date);
}

function parseDateTime({ dateTime, timeZone }: GoogleCalendarDateTime) {
  const instant = Temporal.Instant.from(dateTime);

  if (!timeZone) {
    return instant;
  }

  return instant.toZonedDateTimeISO(timeZone);
}

interface ParsedGoogleCalendarEventOptions {
  calendar: Calendar;
  accountId: string;
  event: GoogleCalendarEvent;
}

export function parseGoogleCalendarEvent({
  calendar,
  accountId,
  event,
}: ParsedGoogleCalendarEventOptions): CalendarEvent {
  const isAllDay = !event.start?.dateTime;

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
    attendees: event.attendees?.map(parseGoogleCalendarAttendee) ?? [],
    url: event.htmlLink,
    providerId: "google",
    accountId,
    calendarId: calendar.id,
    readOnly: calendar.readOnly,
    conferenceData: parseGoogleCalendarConferenceData(event.conferenceData),
  };
}

export function toGoogleCalendarEvent(
  event: CreateEventInput | UpdateEventInput,
): GoogleCalendarEventCreateParams {
  console.log({
    conferenceData: JSON.stringify(event.conferenceData, null, 2),
  });

  const result: GoogleCalendarEventCreateParams = {
    ...("id" in event ? { id: event.id } : {}),
    start: toGoogleCalendarDate(event.start),
    end: toGoogleCalendarDate(event.end),
    conferenceDataVersion: 1, // This ensures the conference data is created, DO NOT REMOVE
  };

  // Only include fields that are actually provided to avoid overwriting with undefined
  if (event.title !== undefined) {
    result.summary = event.title;
  }

  if (event.description !== undefined) {
    result.description = event.description;
  }

  if (event.location !== undefined) {
    result.location = event.location;
  }

  if (event.conferenceData !== undefined) {
    result.conferenceData = event.conferenceData;
  }

  return result;
}

interface ParsedGoogleCalendarCalendarListEntryOptions {
  accountId: string;
  entry: GoogleCalendarCalendarListEntry;
}

export function parseGoogleCalendarCalendarListEntry({
  accountId,
  entry,
}: ParsedGoogleCalendarCalendarListEntryOptions): Calendar {
  if (!entry.id) {
    throw new Error("Calendar ID is missing");
  }

  return {
    id: entry.id,
    name: entry.summaryOverride ?? entry.summary!,
    description: entry.description,
    // location: entry.location,
    timeZone: entry.timeZone,
    primary: entry.primary!,
    readOnly:
      entry.accessRole === "reader" || entry.accessRole === "freeBusyReader",

    providerId: "google",
    accountId,
    color: entry.backgroundColor,
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

function parseGoogleCalendarConferenceData(
  conferenceData: GoogleCalendarEvent["conferenceData"],
): CalendarEvent["conferenceData"] {
  if (!conferenceData?.entryPoints?.length || !conferenceData.conferenceId) {
    return undefined;
  }

  // Filter and map entry points to match our interface
  const entryPoints = conferenceData.entryPoints
    .filter(
      (entry) =>
        entry.entryPointType &&
        entry.uri &&
        (entry.entryPointType === "video" || entry.entryPointType === "phone"),
    )
    .map((entry) => ({
      entryPointType: entry.entryPointType as "video" | "phone",
      uri: entry.uri!,
      label: entry.label ?? entry.uri!,
      passcode:
        entry.passcode ??
        entry.password ??
        entry.accessCode ??
        entry.meetingCode ??
        entry.pin ??
        "",
    }));

  if (entryPoints.length === 0) {
    return undefined;
  }

  return {
    entryPoints: entryPoints.map((entry) => ({
      entryPointType: entry.entryPointType,
      uri: entry.uri,
      meetingCode: entry.passcode,
      password: entry.passcode,
    })),
    conferenceId: conferenceData.conferenceId,
    conferenceSolution: {
      name: conferenceData.conferenceSolution?.name || "Google Meet",
    },
  };
}

export function parseGoogleCalendarAttendee(
  attendee: GoogleCalendarEventAttendee,
): Attendee {
  return {
    id: attendee.id,
    email: attendee.email,
    name: attendee.displayName,
    status: parseGoogleCalendarAttendeeStatus(
      attendee.responseStatus as GoogleCalendarEventAttendeeResponseStatus,
    ),
    type: parseGoogleCalendarAttendeeType(attendee),
    additionalGuests: attendee.additionalGuests,
  };
}
