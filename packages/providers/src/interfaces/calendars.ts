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

export type CalendarFreeBusy =
  | {
      scheduleId: string;
      busy: FreeBusySlot[];
    }
  | {
      scheduleId: string;
      message: string;
      code: string;
    };
