import { Temporal } from "temporal-polyfill";

import { CreateEventInput, UpdateEventInput } from "../../schemas/events";
import {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
  Conference,
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
    conference: parseGoogleCalendarConferenceData(event.conferenceData),
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
    conferenceData: event.conference
      ? toGoogleCalendarConferenceData(event.conference)
      : undefined,
    // Required when creating/updating events with conference data
    ...(event.conference && { conferenceDataVersion: 1 }),
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
  conference: NonNullable<CreateEventInput["conference"]>,
): GoogleCalendarEventConferenceData {
  const entryPoints: GoogleCalendarEventConferenceData["entryPoints"] = [];

  if (conference.joinUrl) {
    entryPoints.push({
      entryPointType: "video",
      uri: conference.joinUrl,
      ...(conference.meetingCode && {
        meetingCode: conference.meetingCode,
        accessCode: conference.meetingCode,
      }),
      ...(conference.password && {
        password: conference.password,
        passcode: conference.password,
      }),
      label: toJoinUrl(conference.joinUrl),
    });
  }

  if (conference.phoneNumbers?.length) {
    conference.phoneNumbers.forEach((phoneNumber) => {
      entryPoints.push({
        entryPointType: "phone",
        uri: phoneNumber.startsWith("tel:")
          ? phoneNumber
          : `tel:${phoneNumber}`,
        label: phoneNumber,
        ...(conference.meetingCode && {
          accessCode: conference.meetingCode,
          pin: conference.meetingCode,
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
    conferenceId: conference.id,
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
): Conference | undefined {
  if (!conferenceData?.entryPoints?.length) {
    return;
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

// let meetings = [
//     MeetingLink(service: .zoom, url: URL(string: "https://zoom.us/j/5551112222")!),
//     MeetingLink(service: .zoom, url: URL(string: "https://any-client.zoom-x.de/j/65194487075")!),
//     MeetingLink(service: .zoom_native, url: URL(string: "zoommtg://zoom.us/join?confno=123456789&pwd=xxxx&zc=0&browser=chrome&uname=Betty")!),
//     MeetingLink(service: .zoom_native, url: URL(string: "zoommtg://zoom-x.de/join?confno=123456789&pwd=xxxx&zc=0&browser=chrome&uname=Betty")!),
//     MeetingLink(service: .blackboard_collab, url: URL(string: "https://us.bbcollab.com/guest/C2419D0F68382D351B97376D6B47ABA2")!),
//     MeetingLink(service: .blackboard_collab, url: URL(string: "https://us.bbcollab.com/invite/EFC53F2790E6E50FFCC2AFBC16CC69EE")!),
//     MeetingLink(service: .facetime, url: URL(string: "https://facetime.apple.com/join#v=1&p=AeVKu1rGEeyppwJC8kftBg&k=FrCNneouFgL26VdnDit78WHNoGjzZyteymBi1U5I23E")!),
//     MeetingLink(service: .slack, url: URL(string: "https://app.slack.com/huddle/T01ABCDEFGH/C02ABCDEFGH")!),
//     MeetingLink(service: .reclaim, url: URL(string: "https://reclaim.ai/z/T01ABCDEFGH/C02ABCDEFGH")!),
//     MeetingLink(service: .tuple, url: URL(string: "https://tuple.app/c/V1StGXR8_Z5jdHi6B")!),
//     MeetingLink(service: .calcom, url: URL(string: "https://app.cal.com/video/1de4BmdXEb983kIUHomUnA")!),
//     MeetingLink(service: .livekit, url: URL(string: "https://meet.livekit.io/rooms/et5r-y80t#r56ryirofs8jjfi3rnxu8ab3qhjsRn6die6mvjhwux82opmkao8bfjb9wggnr2L6")!),
//     MeetingLink(service: .webex, url: URL(string: "https://yourmeetingsite.webex.com/meet/username")!),
//     MeetingLink(service: .webex, url: URL(string: "https://yourmeetingsite.webex.com/yourbusinessID/j.php?MTID=aO5678eFGH")!),
// ]

function detectLinkType(link: string) {
  const url = new URL(link);

  if (url.hostname.includes("zoom.us")) {
    return "zoom";
  }

  if (url.hostname.includes("google.com")) {
    return "google";
  }
}
