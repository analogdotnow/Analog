import type { Attendee, Calendar } from "@repo/providers/interfaces";

import type { RouterOutputs } from "./trpc";

export type CalendarEvent =
  RouterOutputs["events"]["list"]["events"][number] & {
    type?: "draft" | "event";
  };

export type DraftEvent = Partial<CalendarEvent> &
  Required<Pick<CalendarEvent, "id" | "start" | "end">> & {
    type: "draft";
  };

export type { Calendar, Attendee };
