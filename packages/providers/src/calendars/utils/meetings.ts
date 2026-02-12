import type { Attendee, CalendarEvent } from "../../interfaces";

type Meeting = CalendarEvent & { attendees: Attendee[] };

export function isMeeting(event: CalendarEvent): event is Meeting {
  return !!event.attendees && event.attendees.length > 1;
}
