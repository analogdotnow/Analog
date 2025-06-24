import { Client } from "@microsoft/microsoft-graph-client";
import type {
  Calendar as MicrosoftCalendar,
  Event as MicrosoftEvent,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import { CALENDAR_DEFAULTS } from "../constants/calendar";
import { CreateCalendarInput, UpdateCalendarInput } from "../schemas/calendars";
import { CreateEventInput, UpdateEventInput } from "../schemas/events";
import { assignColor } from "./google-calendar/colors";
import type { Calendar, CalendarEvent, CalendarProvider } from "./interfaces";
import {
  calendarPath,
  parseMicrosoftCalendar,
  parseMicrosoftEvent,
  toMicrosoftEvent,
} from "./microsoft-calendar/utils";
import { ProviderError } from "./utils";

interface MicrosoftCalendarProviderOptions {
  accessToken: string;
}

export class MicrosoftCalendarProvider implements CalendarProvider {
  public providerId = "microsoft" as const;
  private graphClient: Client;

  constructor({ accessToken }: MicrosoftCalendarProviderOptions) {
    this.graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => accessToken,
      },
    });
  }

  async calendars(): Promise<Calendar[]> {
    return this.withErrorHandler("calendars", async () => {
      // Microsoft Graph API does not work without $select due to a bug
      const response = await this.graphClient
        .api("/me/calendars?$select=id,name,isDefaultCalendar")
        .get();
      const data = response.value as MicrosoftCalendar[];

      return data.map((calendar, idx) => ({
        ...parseMicrosoftCalendar(calendar),
        color: assignColor(idx),
      }));
    });
  }

  async createCalendar(calendarData: CreateCalendarInput): Promise<Calendar> {
    return this.withErrorHandler("createCalendar", async () => {
      const createdCalendar = (await this.graphClient
        .api("/me/calendars")
        .post(calendarData)) as MicrosoftCalendar;

      return parseMicrosoftCalendar(createdCalendar);
    });
  }

  async updateCalendar(
    calendarId: string,
    calendar: UpdateCalendarInput,
  ): Promise<Calendar> {
    return this.withErrorHandler("updateCalendar", async () => {
      const updatedCalendar = (await this.graphClient
        .api(calendarPath(calendarId))
        .patch(calendar)) as MicrosoftCalendar;

      return parseMicrosoftCalendar(updatedCalendar);
    });
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    return this.withErrorHandler("deleteCalendar", async () => {
      await this.graphClient.api(calendarPath(calendarId)).delete();
    });
  }

  async events(
    calendarId: string,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarEvent[]> {
    return this.withErrorHandler("events", async () => {
      const startTime = timeMin.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax.withTimeZone("UTC").toInstant().toString();

      const response = await this.graphClient
        .api(`${calendarPath(calendarId)}/events`)
        .filter(
          `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
        )
        .orderby("start/dateTime")
        .top(CALENDAR_DEFAULTS.MAX_EVENTS_PER_CALENDAR)
        .get();

      return (response.value as MicrosoftEvent[]).map((event: MicrosoftEvent) =>
        parseMicrosoftEvent(event),
      );
    });
  }

  async createEvent(
    calendarId: string,
    event: CreateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("createEvent", async () => {
      const createdEvent = (await this.graphClient
        .api(calendarPath(calendarId))
        .post(toMicrosoftEvent(event))) as MicrosoftEvent;

      return parseMicrosoftEvent(createdEvent);
    });
  }

  /**
   * Updates an existing event
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   * @param event - Partial event data for updates using UpdateEventInput interface
   * @returns The updated transformed Event object
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("updateEvent", async () => {
      const updatedEvent = (await this.graphClient
        .api(`${calendarPath(calendarId)}/events/${eventId}`)
        .patch(toMicrosoftEvent(event))) as MicrosoftEvent;

      return parseMicrosoftEvent(updatedEvent);
    });
  }

  /**
   * Deletes an event from the calendar
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.withErrorHandler("deleteEvent", async () => {
      await this.graphClient
        .api(`${calendarPath(calendarId)}/events/${eventId}`)
        .delete();
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
