import type { Attendee } from "@/lib/interfaces";

export function isUserOnlyAttendee(attendees: Attendee[]): boolean {
  if (!attendees || attendees.length === 0) {
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
  return !!recurringEventId;
}
