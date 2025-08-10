import type { Temporal } from "temporal-polyfill";

export interface Calendar {
  id: string;
  providerId: "google" | "microsoft";
  name: string;
  description?: string;
  timeZone?: string;
  primary: boolean;
  accountId: string;
  color?: string;
  readOnly: boolean;
}

export interface FreeBusySlot {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  status?: string;
}

export interface CalendarFreeBusy {
  scheduleId: string;
  busy: FreeBusySlot[];
}
