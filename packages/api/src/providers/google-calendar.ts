import { Temporal } from "temporal-polyfill";

import { GoogleCalendar } from "@repo/google-calendar";

import { CALENDAR_DEFAULTS } from "../constants/calendar";
import { CreateEventInput, UpdateEventInput } from "../schemas/events";
import {
  parseGoogleCalendarCalendarListEntry,
  parseGoogleCalendarEvent,
  toGoogleCalendarEvent,
} from "./google-calendar/utils";
import type { Calendar, CalendarEvent, CalendarProvider } from "./interfaces";
import { ProviderError } from "./utils";

interface GoogleCalendarProviderOptions {
  accessToken: string;
}

export class GoogleCalendarProvider implements CalendarProvider {
  public providerId = "google" as const;
  private client: GoogleCalendar;

  constructor({ accessToken }: GoogleCalendarProviderOptions) {
    this.client = new GoogleCalendar({
      accessToken,
    });
  }

  async calendars(): Promise<Calendar[]> {
    return this.withErrorHandler("calendars", async () => {
      const { items } = await this.client.users.me.calendarList.list();

      if (!items) return [];

      return items.map((calendar) =>
        parseGoogleCalendarCalendarListEntry({
          accountId: "",
          entry: calendar,
        }),
      );
    });
  }

  async createCalendar(
    calendar: Omit<Calendar, "id" | "providerId">,
  ): Promise<Calendar> {
    return this.withErrorHandler("createCalendar", async () => {
      const createdCalendar = await this.client.calendars.create({
        summary: calendar.name,
      });

      return parseGoogleCalendarCalendarListEntry({
        accountId: "",
        entry: createdCalendar,
      });
    });
  }

  async updateCalendar(
    calendarId: string,
    calendar: Partial<Calendar>,
  ): Promise<Calendar> {
    return this.withErrorHandler("updateCalendar", async () => {
      const updatedCalendar = await this.client.calendars.update(calendarId, {
        summary: calendar.name,
      });

      return parseGoogleCalendarCalendarListEntry({
        accountId: "",
        entry: updatedCalendar,
      });
    });
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    return this.withErrorHandler("deleteCalendar", async () => {
      await this.client.calendars.delete(calendarId);
    });
  }

  async events(
    calendarId: string,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarEvent[]> {
    return this.withErrorHandler("events", async () => {
      const { items } = await this.client.calendars.events.list(calendarId, {
        timeMin: timeMin.withTimeZone("UTC").toInstant().toString(),
        timeMax: timeMax.withTimeZone("UTC").toInstant().toString(),
        singleEvents: CALENDAR_DEFAULTS.SINGLE_EVENTS,
        orderBy: CALENDAR_DEFAULTS.ORDER_BY,
        maxResults: CALENDAR_DEFAULTS.MAX_EVENTS_PER_CALENDAR,
      });

      return (
        items?.map((event) =>
          parseGoogleCalendarEvent({
            calendarId,
            accountId: "",
            event,
          }),
        ) ?? []
      );
    });
  }

  async createEvent(
    calendarId: string,
    event: CreateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("createEvent", async () => {
      const createdEvent = await this.client.calendars.events.create(
        calendarId,
        toGoogleCalendarEvent(event),
      );

      return parseGoogleCalendarEvent({
        calendarId,
        accountId: "",
        event: createdEvent,
      });
    });
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("updateEvent", async () => {
      const existingEvent = await this.client.calendars.events.retrieve(
        eventId,
        {
          calendarId,
        },
      );

      const updatedEvent = await this.client.calendars.events.update(eventId, {
        ...existingEvent,
        calendarId,
        ...toGoogleCalendarEvent(event),
      });

      return parseGoogleCalendarEvent({
        calendarId,
        accountId: "",
        event: updatedEvent,
      });
    });
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    return this.withErrorHandler("deleteEvent", async () => {
      await this.client.calendars.events.delete(eventId, { calendarId });
    });
  }

  private async withErrorHandler<T>(
    operation: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      console.error(`Failed to ${operation}:`, error);

      throw new ProviderError(error as Error, operation, context);
    }
  }
}
