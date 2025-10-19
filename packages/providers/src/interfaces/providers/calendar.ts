import { Temporal } from "temporal-polyfill";

import type {
  CreateCalendarInput,
  CreateEventInput,
  UpdateEventInput,
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

export interface CalendarProvider {
  providerId: "google" | "microsoft";
  calendars(): Promise<Calendar[]>;
  createCalendar(calendar: CreateCalendarInput): Promise<Calendar>;
  updateCalendar(
    calendarId: string,
    calendar: Partial<Calendar>,
  ): Promise<Calendar>;
  deleteCalendar(calendarId: string): Promise<void>;
  events(
    calendar: Calendar,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
    timeZone?: string,
  ): Promise<{
    events: CalendarEvent[];
    recurringMasterEvents: CalendarEvent[];
  }>;
  sync(
    options: CalendarProviderSyncOptions,
  ): Promise<CalendarProviderSyncResult>;
  event(
    calendar: Calendar,
    eventId: string,
    timeZone?: string,
  ): Promise<CalendarEvent>;
  createEvent(
    calendar: Calendar,
    event: CreateEventInput,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendar: Calendar,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent>;
  deleteEvent(
    calendarId: string,
    eventId: string,
    sendUpdate?: boolean,
  ): Promise<void>;
  responseToEvent(
    calendarId: string,
    eventId: string,
    response: ResponseToEventInput,
  ): Promise<void>;
  moveEvent(
    sourceCalendar: Calendar,
    destinationCalendar: Calendar,
    eventId: string,
    sendUpdate?: boolean,
  ): Promise<CalendarEvent>;
  freeBusy(
    schedules: string[],
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarFreeBusy[]>;
}
