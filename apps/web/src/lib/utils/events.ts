import { Conference } from "@repo/providers/interfaces";

import type { Attendee, CalendarEvent } from "@/lib/interfaces";

export function isUserOnlyAttendee(attendees: Attendee[]): boolean {
  if (attendees.length === 0) {
    return true;
  }

  if (attendees.length > 1) {
    return false;
  }

  return attendees[0]?.organizer ?? false;
}

export function requiresAttendeeConfirmation(
  attendees: Attendee[] | undefined,
): boolean {
  if (!attendees) {
    return false;
  }

  return attendees.length > 1 || !isUserOnlyAttendee(attendees);
}

export function requiresRecurrenceConfirmation(
  recurringEventId: string | undefined,
): boolean {
  return Boolean(recurringEventId);
}

export function isMeeting(event: CalendarEvent): boolean {
  return (event.attendees?.length ?? 0) > 1;
}

type OnlineMeetingEvent = CalendarEvent & {
  conference: Conference & {
    video: {
      joinUrl: {
        value: string;
      };
    };
  };
};

export function isOnlineMeeting(
  event: CalendarEvent,
): event is OnlineMeetingEvent {
  if (!event.conference || event.conference.type !== "conference") {
    return false;
  }

  return Boolean(event.conference.video?.joinUrl);
}
