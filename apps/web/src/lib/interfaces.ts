import type {
  Attendee,
  Calendar,
  CalendarEvent as ProviderCalendarEvent,
} from "@repo/providers/interfaces";

import type { RouterOutputs } from "./trpc";

export type CalendarEvent = ProviderCalendarEvent & {
  type?: "draft" | "event";
};

export type DraftEvent = Partial<CalendarEvent> &
  Required<Pick<CalendarEvent, "id" | "start" | "end">> & {
    type: "draft";
  };

export type { Calendar, Attendee };
