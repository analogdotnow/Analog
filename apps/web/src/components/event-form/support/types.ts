import type { Temporal } from "temporal-polyfill";

import type { EventOutputData } from "@/lib/schemas/event-form/form";

export interface Account {
  id: string;
  email: string;
}

export interface StoredEvent
  extends Omit<
    EventOutputData,
    | "repeats"
    | "repeatType"
    | "startDate"
    | "endDate"
    | "timezone"
    | "startTime"
    | "endTime"
  > {
  id: string;
  startTime: Temporal.ZonedDateTime;
  endTime: Temporal.ZonedDateTime;
  rrule?: string;
  createdAt: string;
  updatedAt: string;
}
