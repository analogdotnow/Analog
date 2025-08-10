import { detectMeetingLink } from "@analog/meeting-links";
import type {
  Event as MicrosoftEvent,
  Attendee as MicrosoftEventAttendee,
  ResponseStatus as MicrosoftEventAttendeeResponseStatus,
  OnlineMeetingInfo,
  OnlineMeetingProviderType,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  CalendarEvent,
  Conference,
} from "../../../interfaces";
import {
  CreateEventInput,
  MicrosoftEventMetadata,
  UpdateEventInput,
} from "../../../schemas/events";
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
    status: event.showAs ?? undefined,
    attendees: event.attendees?.map(parseMicrosoftAttendee) ?? [],
    url: event.webLink ?? undefined,
    color: undefined,
    providerId: "microsoft",
    accountId,
    calendarId: calendar.id,
    readOnly: calendar.readOnly,
    conference: parseMicrosoftConference(event),
    ...(responseStatus && { response: { status: responseStatus } }),
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

function toMicrosoftConferenceData(conference: Conference) {
  const onlineMeeting: Partial<OnlineMeetingInfo> = {};

  // Set conference ID if available
  if (conference.conferenceId) {
    onlineMeeting.conferenceId = conference.conferenceId;
  }

  // Set join URL from video entry point
  if (conference.video?.joinUrl?.value) {
    onlineMeeting.joinUrl = conference.video.joinUrl.value;
  }

  // Set phone numbers if available
  if (conference.phone?.length) {
    onlineMeeting.phones = conference.phone.map((phoneEntry) => ({
      number: phoneEntry.joinUrl.value.replace(/^tel:/, ""),
    }));
  }

  // Determine the provider
  let onlineMeetingProvider: OnlineMeetingProviderType = "unknown";
  if (conference.name) {
    const name = conference.name.toLowerCase();
    if (name.includes("teams") || name.includes("microsoft")) {
      onlineMeetingProvider = "teamsForBusiness";
    } else if (name.includes("skype")) {
      onlineMeetingProvider = "skypeForBusiness";
    }
  }

  return {
    isOnlineMeeting: true,
    onlineMeeting,
    onlineMeetingProvider,
  };
}

export function toMicrosoftEvent(
  event: CreateEventInput | UpdateEventInput,
): MicrosoftEvent {
  const metadata = event.metadata as MicrosoftEventMetadata | undefined;

  return {
    subject: event.title,
    body: event.description
      ? { contentType: "text", content: event.description }
      : undefined,
    start: toMicrosoftDate({
      value: event.start,
      originalTimeZone: metadata?.originalStartTimeZone,
    }),
    end: toMicrosoftDate({
      value: event.end,
      originalTimeZone: metadata?.originalEndTimeZone,
    }),
    isAllDay: event.allDay ?? false,
    location: event.location ? { displayName: event.location } : undefined,
    // ...(event.conference && toMicrosoftConferenceData(event.conference)),
  };
}

function parseConferenceFallback(
  event: MicrosoftEvent,
): Conference | undefined {
  if (!event.location) {
    return undefined;
  }

  if (event.location.locationUri) {
    const service = detectMeetingLink(event.location.locationUri);

    if (service) {
      return {
        id: service.id,
        name: service.name,
        video: {
          joinUrl: {
            value: service.joinUrl,
          },
        },
      };
    }
  }

  if (!event.location.displayName) {
    return undefined;
  }

  const service = detectMeetingLink(event.location.displayName);

  if (!service) {
    return undefined;
  }

  return {
    id: service.id,
    name: service.name,
    video: {
      joinUrl: {
        value: service.joinUrl,
      },
    },
  };
}

function parseMicrosoftConference(
  event: MicrosoftEvent,
): Conference | undefined {
  const joinUrl = event.onlineMeeting?.joinUrl ?? event.onlineMeetingUrl;

  if (!joinUrl) {
    return parseConferenceFallback(event);
  }

  const phoneNumbers = event.onlineMeeting?.phones
    ?.map((p) => p.number)
    .filter((n): n is string => Boolean(n));

  // TODO: how to handle toll/toll-free numbers and quick dial?
  return {
    id: detectMeetingLink(joinUrl)?.id,
    conferenceId: event.onlineMeeting?.conferenceId ?? undefined,
    name:
      event.onlineMeetingProvider === "teamsForBusiness"
        ? "Microsoft Teams"
        : undefined,
    video: {
      joinUrl: {
        value: joinUrl,
      },
      meetingCode: event.onlineMeeting?.conferenceId ?? undefined,
    },
    ...(phoneNumbers &&
      phoneNumbers.length && {
        phone: phoneNumbers.map((number) => ({
          joinUrl: {
            label: number,
            value: number.startsWith("tel:")
              ? number
              : `tel:${number.replace(/[- ]/g, "")}`,
          },
        })),
      }),
  };
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
