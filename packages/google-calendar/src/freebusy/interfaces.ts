import type { GoogleCalendarRequestOptions } from "../interfaces";

export interface Error {
  domain?: string;
  reason?: string;
}

export interface FreeBusyCalendar {
  busy?: TimePeriod[];
  errors?: Error[];
}

export interface FreeBusyGroup {
  calendars?: string[];
  errors?: Error[];
}

export interface FreeBusyRequest {
  calendarExpansionMax?: number;
  groupExpansionMax?: number;
  items?: FreeBusyRequestItem[];
  timeMax?: string;
  timeMin?: string;
  timeZone?: string;
}

export interface FreeBusyRequestItem {
  id?: string;
}

export interface FreeBusyResponse {
  calendars?: Record<string, FreeBusyCalendar>;
  groups?: Record<string, FreeBusyGroup>;
  kind?: string;
  timeMax?: string;
  timeMin?: string;
}

export interface TimePeriod {
  end?: string;
  start?: string;
}

export interface QueryFreebusyInput
  extends GoogleCalendarRequestOptions, FreeBusyRequest {}

export type QueryFreebusyResponse = FreeBusyResponse;
