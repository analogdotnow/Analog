import type { Calendar, CalendarEvent } from "@/lib/interfaces";

export function canMoveBetweenCalendars(
  event: CalendarEvent,
  destination: Calendar,
): boolean {
  const isSameCalendar =
    event.accountId === destination.accountId &&
    event.calendarId === destination.id;

  if (isSameCalendar) {
    return false;
  }

  // TODO: support recurring events
  return !event.readOnly && !destination.readOnly;
}
