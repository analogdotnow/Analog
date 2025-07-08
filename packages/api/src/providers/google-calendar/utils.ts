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
  GoogleCalendarEventConferenceData,
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
    dateTime: value.toString({ timeZoneName: "never", offset: "auto" }),
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
  return {
    ...("id" in event ? { id: event.id } : {}),
    summary: event.title,
    description: event.description,
    location: event.location,
    start: toGoogleCalendarDate(event.start),
    end: toGoogleCalendarDate(event.end),
    conferenceData: event.conferenceData
      ? toGoogleCalendarConferenceData(event.conferenceData)
      : undefined,
    // Required when creating/updating events with conference data
    ...(event.conferenceData && { conferenceDataVersion: 1 }),
  };
}

function toGoogleCalendarConferenceData(
  conferenceData: NonNullable<CreateEventInput["conferenceData"]>,
): GoogleCalendarEventConferenceData {
  const entryPoints: GoogleCalendarEventConferenceData["entryPoints"] = [];

  if (conferenceData.joinUrl) {
    const videoEntryPoint: (typeof entryPoints)[0] = {
      entryPointType: "video",
      uri: conferenceData.joinUrl,
    };

    if (conferenceData.meetingCode) {
      videoEntryPoint.meetingCode = conferenceData.meetingCode;
      videoEntryPoint.accessCode = conferenceData.meetingCode;
    }

    if (conferenceData.password) {
      videoEntryPoint.password = conferenceData.password;
      videoEntryPoint.passcode = conferenceData.password;
    }

    if (conferenceData.joinUrl) {
      try {
        const url = new URL(conferenceData.joinUrl);
        videoEntryPoint.label = url.hostname + url.pathname;
      } catch {
        videoEntryPoint.label = conferenceData.joinUrl;
      }
    }

    entryPoints.push(videoEntryPoint);
  }

  if (conferenceData.phoneNumbers?.length) {
    conferenceData.phoneNumbers.forEach((phoneNumber) => {
      const phoneEntryPoint: (typeof entryPoints)[0] = {
        entryPointType: "phone",
        uri: phoneNumber.startsWith("tel:")
          ? phoneNumber
          : `tel:${phoneNumber}`,
        label: phoneNumber,
      };

      if (conferenceData.meetingCode) {
        phoneEntryPoint.accessCode = conferenceData.meetingCode;
        phoneEntryPoint.pin = conferenceData.meetingCode;
      }

      entryPoints.push(phoneEntryPoint);
    });
  }

  let conferenceSolutionType = "hangoutsMeet"; // Default to Google Meet
  if (conferenceData.name) {
    const lowerName = conferenceData.name.toLowerCase();
    conferenceSolutionType = lowerName.includes("google")
      ? "hangoutsMeet"
      : "addOn";
  }

  return {
    conferenceId: conferenceData.id,
    conferenceSolution: {
      name: conferenceData.name ?? "Google Meet",
      key: {
        type: conferenceSolutionType,
      },
    },
    entryPoints: entryPoints.length > 0 ? entryPoints : undefined,
    ...(conferenceData.extra && {
      parameters: {
        addOnParameters: {
          parameters: Object.fromEntries(
            Object.entries(conferenceData.extra).map(([key, value]) => [
              key,
              String(value),
            ]),
          ),
        },
      },
    }),
  };
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
  if (!conferenceData?.entryPoints?.length) {
    return undefined;
  }

  const videoEntry = conferenceData.entryPoints.find(
    (e) => e.entryPointType === "video" && e.uri,
  );

  const phoneNumbers = conferenceData.entryPoints
    .filter((e) => e.entryPointType === "phone" && e.uri)
    .map((e) => e.uri as string);

  if (!videoEntry?.uri) {
    return undefined;
  }

  const accessCode =
    videoEntry.meetingCode ?? videoEntry.passcode ?? videoEntry.password;

  return {
    id: conferenceData.conferenceId,
    name: conferenceData.conferenceSolution?.name ?? "Google Meet",
    joinUrl: videoEntry.uri!,
    meetingCode: accessCode ?? "",
    phoneNumbers: phoneNumbers.length ? phoneNumbers : undefined,
    password: accessCode,
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
