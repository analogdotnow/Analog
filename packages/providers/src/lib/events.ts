import type { CalendarEvent, Meeting } from "../interfaces/events";

export function isMeeting(event: CalendarEvent): event is Meeting {
  return !!event.attendees && event.attendees.length > 1;
}
