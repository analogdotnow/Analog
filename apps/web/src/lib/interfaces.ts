import type {
  Attendee,
  AttendeeStatus,
  Calendar,
  Conference,
  Frequency,
  Recurrence,
  Weekday,
} from "@repo/api/interfaces";

import type { RouterOutputs } from "./trpc";

export type CalendarEvent =
  RouterOutputs["events"]["list"]["events"][number] & {
    type?: "draft" | "event";
  };

export type DraftEvent = Partial<CalendarEvent> &
  Required<Pick<CalendarEvent, "id" | "start" | "end">> & {
    type: "draft";
  };

export type {
  Calendar,
  Attendee,
  Conference,
  Recurrence,
  Frequency,
  Weekday,
  AttendeeStatus,
};
