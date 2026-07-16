import { Temporal } from "temporal-polyfill";

import type {
  CreateCalendarInput,
  CreateEventInput,
  UpdateEventPatch,
} from "@repo/schemas";

import type {
  Calendar,
  CalendarEvent,
  CalendarEventSyncItem,
  CalendarFreeBusy,
} from "../../interfaces";

export interface ResponseToEventInput {
  status: "accepted" | "tentative" | "declined" | "unknown";
  comment?: string;
  sendUpdate: boolean;
}

export interface CalendarProviderSyncOptions {
  calendar: Calendar;
  initialSyncToken?: string | undefined;
  timeMin?: Temporal.ZonedDateTime;
  timeMax?: Temporal.ZonedDateTime;
  timeZone: string;
}

export interface CalendarProviderSyncResult {
  changes: CalendarEventSyncItem[];
  syncToken: string | undefined;
  status: "incremental" | "full";
}

export interface CalendarProviderCalendarsGetOptions {
  calendarId: string;
}

export interface CalendarProviderCalendarsCreateOptions {
  calendar: CreateCalendarInput;
}

export interface CalendarProviderCalendarsUpdateOptions {
  calendarId: string;
  calendar: Partial<Calendar>;
}

export interface CalendarProviderCalendarsDeleteOptions {
  calendarId: string;
}

export interface CalendarProviderCalendars {
  list(): Promise<Calendar[]>;
  get(options: CalendarProviderCalendarsGetOptions): Promise<Calendar>;
  create(options: CalendarProviderCalendarsCreateOptions): Promise<Calendar>;
  update(options: CalendarProviderCalendarsUpdateOptions): Promise<Calendar>;
  delete(options: CalendarProviderCalendarsDeleteOptions): Promise<void>;
}

export interface CalendarProviderEventsListOptions {
  calendar: Calendar;
  timeMin: Temporal.ZonedDateTime;
  timeMax: Temporal.ZonedDateTime;
  timeZone?: string;
}

export interface CalendarProviderEventsGetOptions {
  calendar: Calendar;
  eventId: string;
  timeZone?: string;
}

export interface CalendarProviderEventsCreateOptions {
  calendar: Calendar;
  event: CreateEventInput;
}

// Sparse patch: absent/undefined fields are left untouched by the provider;
// null clears where the schema allows it.
export interface CalendarProviderEventsUpdateOptions {
  calendar: Calendar;
  eventId: string;
  event: UpdateEventPatch;
}

export interface CalendarProviderEventsDeleteOptions {
  calendarId: string;
  eventId: string;
  sendUpdate: boolean;
}

export interface CalendarProviderEventsRespondOptions {
  calendarId: string;
  eventId: string;
  response: ResponseToEventInput;
}

export interface CalendarProviderEventsMoveOptions {
  sourceCalendar: Calendar;
  destinationCalendar: Calendar;
  eventId: string;
  sendUpdate?: boolean;
}

export interface CalendarProviderEvents {
  list(options: CalendarProviderEventsListOptions): Promise<{
    events: CalendarEvent[];
    recurringMasterEvents: CalendarEvent[];
  }>;
  sync(
    options: CalendarProviderSyncOptions,
  ): Promise<CalendarProviderSyncResult>;
  get(options: CalendarProviderEventsGetOptions): Promise<CalendarEvent>;
  create(options: CalendarProviderEventsCreateOptions): Promise<CalendarEvent>;
  update(options: CalendarProviderEventsUpdateOptions): Promise<CalendarEvent>;
  delete(options: CalendarProviderEventsDeleteOptions): Promise<void>;
  respond(options: CalendarProviderEventsRespondOptions): Promise<void>;
  move(options: CalendarProviderEventsMoveOptions): Promise<CalendarEvent>;
}

export interface CalendarProviderFreeBusyQueryOptions {
  schedules: string[];
  timeMin: Temporal.ZonedDateTime;
  timeMax: Temporal.ZonedDateTime;
}

export interface CalendarProviderFreeBusy {
  query(
    options: CalendarProviderFreeBusyQueryOptions,
  ): Promise<CalendarFreeBusy[]>;
}

export interface CalendarProvider {
  providerId: "google" | "microsoft";
  calendars: CalendarProviderCalendars;
  events: CalendarProviderEvents;
  freeBusy: CalendarProviderFreeBusy;
}
