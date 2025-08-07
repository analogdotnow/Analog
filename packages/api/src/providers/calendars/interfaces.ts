import { Temporal } from "temporal-polyfill";

import type { Calendar } from "../../interfaces/calendars";
import type { CalendarEvent } from "../../interfaces/events";
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
  ): Promise<CalendarEvent[]>;
  createEvent(
    calendar: Calendar,
    event: CreateEventInput,
  ): Promise<CalendarEvent>;
  updateEvent(
    calendar: Calendar,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
  responseToEvent(
    calendarId: string,
    eventId: string,
    response: ResponseToEventInput,
  ): Promise<void>;
}
