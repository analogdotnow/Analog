import type { Temporal } from "temporal-polyfill";

export interface Calendar {
  id: string;
  provider: {
    id: "google" | "microsoft";
    accountId: string;
  };
  name: string;
  description?: string;
  etag?: string;
  timeZone?: string;
  primary: boolean;
  color?: string;
  readOnly: boolean;
  syncToken: string | null;
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
