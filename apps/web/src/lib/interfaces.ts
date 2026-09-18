import type {
  Attendee,
  Calendar,
  CalendarEvent,
} from "@repo/providers/interfaces";

export type DraftEvent = Partial<CalendarEvent> &
  Required<Pick<CalendarEvent, "id" | "start" | "end">> & {
    type: "draft";
  };

// A sparse set of event fields to merge onto an event. Mapped over the union
// directly (not via Partial) so it does not distribute per provider/time arm,
// which would reject a `start` or `calendar` whose arm is unknown statically.
export type EventChanges = { [K in keyof CalendarEvent]?: CalendarEvent[K] };

export type { Calendar, Attendee, CalendarEvent };
