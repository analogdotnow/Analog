import type {
  Attendee,
  Calendar,
  CalendarEvent,
} from "@repo/providers/interfaces";

export type DraftEvent = Partial<CalendarEvent> &
  Required<Pick<CalendarEvent, "id" | "start" | "end">> & {
    type: "draft";
  };

export type { Calendar, Attendee, CalendarEvent };
