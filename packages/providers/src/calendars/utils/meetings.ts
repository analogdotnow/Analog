import type { CalendarEvent } from "../../interfaces";

type Meeting = Omit<CalendarEvent, "attendees"> &
  Required<Pick<CalendarEvent, "attendees">>;

export function isMeeting(event: CalendarEvent): event is Meeting {
  return !!event.attendees && event.attendees.length > 1;
}
