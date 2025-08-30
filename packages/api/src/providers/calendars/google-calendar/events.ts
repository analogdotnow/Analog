import { detectMeetingLink } from "@analog/meeting-links";
import { Temporal } from "temporal-polyfill";

import {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
  Conference,
  Recurrence,
} from "../../../interfaces";
import { CreateEventInput, UpdateEventInput } from "../../../schemas/events";
import { toRecurrenceProperties } from "../../../utils/recurrences/export";
import { fromRecurrenceProperties } from "../../../utils/recurrences/parse";
import {
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

function parseResponseStatus(event: GoogleCalendarEvent) {
  const selfAttendee = event.attendees?.find((a) => a.self);

  if (!selfAttendee) {
    return undefined;
  }

  return {
    status: parseGoogleCalendarAttendeeStatus(
      selfAttendee.responseStatus as GoogleCalendarEventAttendeeResponseStatus,
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

  return fromRecurrenceProperties(
    event.recurrence,
    normalizeGoogleTimeZone(timeZone),
  );
}

interface ParsedGoogleCalendarEventOptions {
  calendar: Calendar;
  accountId: string;
  event: GoogleCalendarEvent;
  defaultTimeZone?: string;
}

export function parseGoogleCalendarEvent({
  calendar,
  accountId,
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
    attendees: event.attendees
      ? parseGoogleCalendarAttendeeList(event.attendees)
      : [],
    url: event.htmlLink,
    etag: event.etag,
    providerId: "google",
    accountId,
    calendarId: calendar.id,
    readOnly:
      calendar.readOnly ||
      ["birthday", "focusTime", "outOfOffice", "workingLocation"].includes(
        event.eventType ?? "",
      ),
    conference: parseGoogleCalendarConferenceData(event),
    ...(response && { response }),
    ...(recurrence && { recurrence }),
    recurringEventId: event.recurringEventId,
    metadata: {
      ...(event.recurrence && {
        originalRecurrence: event.recurrence,
      }),
      ...(event.recurringEventId && {
        recurringEventId: event.recurringEventId,
      }),
    },
  };
}

function toGoogleCalenderResponseStatus(status: AttendeeStatus) {
  if (status === "unknown") {
    return "needsAction";
  }

  return status;
}

export function toGoogleCalendarAttendee(
  attendee: Attendee,
): GoogleCalendarEventAttendee {
  return {
    email: attendee.email,
    displayName: attendee.name,
    optional: attendee.type === "optional" ? true : undefined,
    resource: attendee.type === "resource" ? true : undefined,
    responseStatus: toGoogleCalenderResponseStatus(attendee.status),
    comment: attendee.comment,
    additionalGuests: attendee.additionalGuests,
  };
}

function toGoogleCalendarAttendees(
  attendees: Attendee[],
): GoogleCalendarEventAttendee[] {
  return attendees.map(toGoogleCalendarAttendee);
}

export function toGoogleCalendarEvent(
  event: CreateEventInput | UpdateEventInput,
): GoogleCalendarEventCreateParams {
  return {
    id: event.id,
    summary: event.title,
    description: event.description,
    location: event.location,
    start: toGoogleCalendarDate(event.start),
    end: toGoogleCalendarDate(event.end),
    ...(event.attendees && {
      attendees: toGoogleCalendarAttendees(event.attendees),
    }),
    conferenceData: event.conference
      ? toGoogleCalendarConferenceData(event.conference)
      : undefined,
    // Should always be 1 to ensure conference data is retained for all event modification requests.
    conferenceDataVersion: 1,
    // TODO: how to handle recurrence when the time zone is changed (i.e. until, rDate, exDate).
    ...(event.recurrence && {
      recurrence: toRecurrenceProperties(event.recurrence),
    }),
    recurringEventId: event.recurringEventId,
  };
}

function toJoinUrl(joinUrl: string) {
  try {
    const url = new URL(joinUrl);

    return url.hostname + url.pathname;
  } catch {
    return joinUrl;
  }
}

function toGoogleCalendarConferenceData(
  conference: Conference,
): GoogleCalendarEventConferenceData {
  const entryPoints: GoogleCalendarEventConferenceData["entryPoints"] = [];

  if (conference.video?.joinUrl?.value) {
    entryPoints.push({
      entryPointType: "video",
      uri: conference.video.joinUrl.value,
      ...(conference.video.meetingCode && {
        meetingCode: conference.video.meetingCode,
        accessCode: conference.video.meetingCode,
      }),
      ...(conference.video.password && {
        password: conference.video.password,
        passcode: conference.video.password,
      }),
      label:
        conference.video.joinUrl.label ||
        toJoinUrl(conference.video.joinUrl.value),
    });
  }

  if (conference.sip?.joinUrl?.value) {
    entryPoints.push({
      entryPointType: "sip",
      uri: conference.sip.joinUrl.value,
      ...(conference.sip.meetingCode && {
        meetingCode: conference.sip.meetingCode,
        accessCode: conference.sip.meetingCode,
      }),
      ...(conference.sip.password && {
        password: conference.sip.password,
        passcode: conference.sip.password,
      }),
      label: conference.sip.joinUrl.label,
    });
  }

  if (conference.phone?.length) {
    conference.phone.forEach((phoneEntry) => {
      entryPoints.push({
        entryPointType: "phone",
        uri: phoneEntry.joinUrl.value.startsWith("tel:")
          ? phoneEntry.joinUrl.value
          : `tel:${phoneEntry.joinUrl.value}`,
        label: phoneEntry.joinUrl.label || phoneEntry.joinUrl.value,
        ...(phoneEntry.accessCode && {
          accessCode: phoneEntry.accessCode,
          pin: phoneEntry.accessCode,
        }),
      });
    });
  }

  // Default to Google Meet
  const conferenceSolutionType = conference.name
    ? conference.name.toLowerCase().includes("google")
      ? "hangoutsMeet"
      : "addOn"
    : "hangoutsMeet";

  return {
    conferenceId: conference.conferenceId,
    conferenceSolution: {
      name: conference.name ?? "Google Meet",
      key: {
        type: conferenceSolutionType,
      },
    },
    entryPoints: entryPoints.length > 0 ? entryPoints : undefined,
    ...(conference.extra && {
      parameters: {
        addOnParameters: {
          parameters: Object.fromEntries(
            Object.entries(conference.extra).map(([key, value]) => [
              key,
              String(value),
            ]),
          ),
        },
      },
    }),
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

function parseGoogleCalendarConferenceFallback(
  event: GoogleCalendarEvent,
): Conference | undefined {
  // Function to extract URLs from text using a comprehensive regex
  const extractUrls = (text: string): string[] => {
    const urlRegex = /https?:\/\/[^\s<>"'{}|\\^`[\]]+/gi;

    return text.match(urlRegex) || [];
  };

  // Function to check if a URL is a meeting link
  const checkMeetingLink = (url: string): Conference | undefined => {
    const service = detectMeetingLink(url);

    if (service) {
      return {
        id: service.id,
        name: service.name,
        video: {
          joinUrl: {
            value: service.joinUrl,
          },
          meetingCode: service.id,
        },
      };
    }

    return undefined;
  };

  // 1. Check hangoutLink (legacy Google Meet)
  if (event.hangoutLink) {
    const service = checkMeetingLink(event.hangoutLink);

    if (service) {
      return service;
    }
  }

  // 2. Check description for meeting links
  if (event.description) {
    const urls = extractUrls(event.description);

    for (const url of urls) {
      const service = checkMeetingLink(url);

      if (service) {
        return service;
      }
    }
  }

  // 3. Check location field
  if (event.location) {
    const urls = extractUrls(event.location);

    for (const url of urls) {
      const service = checkMeetingLink(url);

      if (service) {
        return service;
      }
    }
  }

  // 4. Check source.url
  if (event.source?.url) {
    const service = checkMeetingLink(event.source.url);

    if (service) {
      return service;
    }
  }

  // 6. Check attachments
  if (event.attachments) {
    for (const attachment of event.attachments) {
      if (attachment.fileUrl) {
        const service = checkMeetingLink(attachment.fileUrl);

        if (service) {
          return service;
        }
      }
    }
  }

  // 7. Check gadget.link (legacy)
  if (event.gadget?.link) {
    const service = checkMeetingLink(event.gadget.link);

    if (service) {
      return service;
    }
  }

  return undefined;
}

export function parseGoogleCalendarConferenceData(
  event: GoogleCalendarEvent,
): Conference | undefined {
  if (!event.conferenceData?.entryPoints?.length) {
    // If no conference data, fall back to searching other fields
    return parseGoogleCalendarConferenceFallback(event);
  }

  // There is at most one video entry point
  const videoEntryPoint = event.conferenceData.entryPoints.find(
    (e) => e.entryPointType === "video",
  );

  // There is at most one sip entry point
  const sipEntryPoint = event.conferenceData.entryPoints.find(
    (e) => e.entryPointType === "sip",
  );

  // There can be multiple phone entry points
  const phoneEntryPoints = event.conferenceData.entryPoints.filter(
    (e) => e.entryPointType === "phone" && e.uri,
  );

  // TODO: handle "more" type entry points
  return {
    id: videoEntryPoint?.uri
      ? detectMeetingLink(videoEntryPoint.uri)?.id
      : undefined,
    conferenceId: event.conferenceData.conferenceId,
    name: event.conferenceData.conferenceSolution?.name,
    ...(videoEntryPoint &&
      videoEntryPoint.uri && {
        video: {
          joinUrl: {
            label: videoEntryPoint.label,
            value: videoEntryPoint.uri,
          },
          meetingCode: videoEntryPoint.meetingCode,
          accessCode: videoEntryPoint.accessCode,
          password: videoEntryPoint.password,
        },
      }),
    ...(sipEntryPoint &&
      sipEntryPoint.uri && {
        sip: {
          joinUrl: {
            label: sipEntryPoint.label,
            value: sipEntryPoint.uri,
          },
          meetingCode: sipEntryPoint.meetingCode,
          accessCode: sipEntryPoint.accessCode,
          password: sipEntryPoint.password,
        },
      }),
    ...(phoneEntryPoints.length > 0 && {
      phone: phoneEntryPoints.map((entryPoint) => ({
        joinUrl: {
          label: entryPoint.label,
          value: entryPoint.uri!,
        },
        meetingCode: entryPoint.meetingCode,
        accessCode: entryPoint.accessCode,
        password: entryPoint.password,
      })),
    }),
  };
}

export function parseGoogleCalendarAttendee(
  attendee: GoogleCalendarEventAttendee,
): Attendee {
  return {
    id: attendee.id,
    email: attendee.email!,
    name: attendee.displayName,
    status: parseGoogleCalendarAttendeeStatus(
      attendee.responseStatus as GoogleCalendarEventAttendeeResponseStatus,
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
