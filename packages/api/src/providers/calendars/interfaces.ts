import { Temporal } from "temporal-polyfill";

import type {
  Calendar,
  CalendarEvent,
  CalendarFreeBusy,
} from "../../interfaces";
import type { CreateEventInput, UpdateEventInput } from "../../schemas/events";

export interface ResponseToEventInput {
  status: "accepted" | "tentative" | "declined" | "unknown";
  comment?: string;
  sendUpdate: boolean;
}

export interface CalendarProvider {
  providerId: "google" | "microsoft";
  calendars(): Promise<Calendar[]>;
  createCalendar(
    calendar: Omit<Calendar, "id" | "providerId">,
  ): Promise<Calendar>;
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
