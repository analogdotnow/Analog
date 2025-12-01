import type { Temporal } from "temporal-polyfill";

export type ProviderId = "google" | "microsoft";

export interface Provider {
  id: ProviderId;
  accountId: string;
}

export interface Calendar {
  id: string;
  provider: Provider;
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
