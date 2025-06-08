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
    const { items } = await this.client.users.me.calendarList.list();

    if (!items) return [];

    return items.map((calendar) =>
      parseGoogleCalendarCalendarListEntry({
        accountId: "",
        entry: calendar,
      }),
    );
  }

  async createCalendar(
    calendar: Omit<Calendar, "id" | "providerId">,
  ): Promise<Calendar> {
    const createdCalendar = await this.client.calendars.create({
      summary: calendar.name,
    });

    return parseGoogleCalendarCalendarListEntry({
      accountId: "",
      entry: createdCalendar,
    });
  }

  async updateCalendar(
    calendarId: string,
    calendar: Partial<Calendar>,
  ): Promise<Calendar> {
    const updatedCalendar = await this.client.calendars.update(calendarId, {
      summary: calendar.name,
    });

    return parseGoogleCalendarCalendarListEntry({
      accountId: "",
      entry: updatedCalendar,
    });
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    await this.client.calendars.delete(calendarId);
  }

  async events(
    calendarId: string,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarEvent[]> {
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
  }

  async createEvent(
    calendarId: string,
    event: CreateEventInput,
  ): Promise<CalendarEvent> {
    const createdEvent = await this.client.calendars.events.create(
      calendarId,
      toGoogleCalendarEvent(event),
    );

    return parseGoogleCalendarEvent({
      calendarId,
      accountId: "",
      event: createdEvent,
    });
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent> {
    const existingEvent = await this.client.calendars.events.retrieve(eventId, {
      calendarId,
    });

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
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.client.calendars.events.delete(eventId, { calendarId });
  }
}
