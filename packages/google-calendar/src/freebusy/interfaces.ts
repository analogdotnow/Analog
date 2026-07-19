import type { GoogleCalendarRequestOptions } from "../interfaces";

export interface Error {
  domain?: string;
  reason?: string;
}

export interface FreeBusyCalendar {
  // Optional in the API reference, but always present: empty when the calendar's computation failed (see errors).
  busy: TimePeriod[];
  errors?: Error[];
}

export interface FreeBusyGroup {
  calendars?: string[];
  errors?: Error[];
}

export interface FreeBusyRequest {
  calendarExpansionMax?: number;
  groupExpansionMax?: number;
  items: FreeBusyRequestItem[];
  timeMax: string;
  timeMin: string;
  timeZone?: string;
}

export interface FreeBusyRequestItem {
  id: string;
}

export interface FreeBusyResponse {
  // Optional in the API reference, but always present: one entry per requested calendar.
  calendars: Record<string, FreeBusyCalendar>;
  groups?: Record<string, FreeBusyGroup>;
  kind?: string;
  timeMax?: string;
  timeMin?: string;
}

// Optional in the API reference, but a busy period always has both ends.
export interface TimePeriod {
  end: string;
  start: string;
}

export interface QueryFreebusyInput
  extends GoogleCalendarRequestOptions, FreeBusyRequest {}

export type QueryFreebusyResponse = FreeBusyResponse;
