import type { CalendarEvent, Meeting } from "../interfaces/events";

// A meeting involves at least one participant besides the organizer: Graph
// omits the organizer from attendees while Google includes them, so counting
// entries is not portable — check for a non-resource, non-organizer attendee.
export function isMeeting(event: CalendarEvent): event is Meeting {
  return (
    event.attendees?.some(
      (attendee) => attendee.type !== "resource" && !attendee.organizer,
    ) ?? false
  );
}
