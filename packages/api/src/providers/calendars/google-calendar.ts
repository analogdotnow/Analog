import { Temporal } from "temporal-polyfill";

import {
  AuthenticationError,
  ConflictError,
  GoogleCalendar,
} from "@repo/google-calendar";

import { CALENDAR_DEFAULTS } from "../../constants/calendar";
import type {
  Calendar,
  CalendarEvent,
  CalendarFreeBusy,
} from "../../interfaces";
import type { CreateEventInput, UpdateEventInput } from "../../schemas/events";
import { refreshGoogleAccessToken } from "../../utils/token-refresh";
import { ProviderError } from "../lib/provider-error";
import { parseGoogleCalendarCalendarListEntry } from "./google-calendar/calendars";
import {
  parseGoogleCalendarEvent,
  toGoogleCalendarAttendeeResponseStatus,
  toGoogleCalendarEvent,
} from "./google-calendar/events";
import { parseGoogleCalendarFreeBusy } from "./google-calendar/freebusy";
import type { CalendarProvider, ResponseToEventInput } from "./interfaces";

interface GoogleCalendarProviderOptions {
  accessToken: string;
  refreshToken: string;
  accountId: string;
}

export class GoogleCalendarProvider implements CalendarProvider {
  public readonly providerId = "google" as const;
  public readonly accountId: string;
  private refreshToken: string;
  private client: GoogleCalendar;

  constructor({
    accessToken,
    refreshToken,
    accountId,
  }: GoogleCalendarProviderOptions) {
    this.accountId = accountId;
    this.refreshToken = refreshToken;
    this.client = new GoogleCalendar({
      accessToken,
    });
  }

  async calendars(): Promise<Calendar[]> {
    return this.withErrorHandler("calendars", async () => {
      const { items } = await this.client.users.me.calendarList.list();

      if (!items) return [];

      return items.map((calendar) => {
        const parsedCalendar = parseGoogleCalendarCalendarListEntry({
          accountId: this.accountId,
          entry: calendar,
        });

        return parsedCalendar;
      });
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
        accountId: this.accountId,
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
        accountId: this.accountId,
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
    calendar: Calendar,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
    timeZone?: string,
  ): Promise<{
    events: CalendarEvent[];
    recurringMasterEvents: CalendarEvent[];
  }> {
    return this.withErrorHandler("events", async () => {
      const { items } = await this.client.calendars.events.list(calendar.id, {
        timeMin: timeMin.withTimeZone("UTC").toInstant().toString(),
        timeMax: timeMax.withTimeZone("UTC").toInstant().toString(),
        singleEvents: CALENDAR_DEFAULTS.SINGLE_EVENTS,
        orderBy: CALENDAR_DEFAULTS.ORDER_BY,
        maxResults: CALENDAR_DEFAULTS.MAX_EVENTS_PER_CALENDAR,
      });

      const events: CalendarEvent[] =
        items?.map((event) =>
          parseGoogleCalendarEvent({
            calendar,
            accountId: this.accountId,
            event,
            defaultTimeZone: timeZone ?? "UTC",
          }),
        ) ?? [];

      const instances = events.filter((e) => e.recurringEventId);
      const masters = new Set<string>([]);

      for (const instance of instances) {
        masters.add(instance.recurringEventId!);
      }

      if (masters.size === 0) {
        return { events, recurringMasterEvents: [] };
      }

      const recurringMasterEvents = await Promise.all(
        Array.from(masters).map((id) => this.event(calendar, id, timeZone)),
      );

      return { events, recurringMasterEvents };
    });
  }

  async event(
    calendar: Calendar,
    eventId: string,
    timeZone?: string,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("event", async () => {
      const event = await this.client.calendars.events.retrieve(eventId, {
        calendarId: calendar.id,
      });

      return parseGoogleCalendarEvent({
        calendar,
        accountId: this.accountId,
        event,
        defaultTimeZone: timeZone ?? "UTC",
      });
    });
  }

  async createEvent(
    calendar: Calendar,
    event: CreateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("createEvent", async () => {
      try {
        const createdEvent = await this.client.calendars.events.create(
          calendar.id,
          toGoogleCalendarEvent(event),
        );

        return parseGoogleCalendarEvent({
          calendar,
          accountId: this.accountId,
          event: createdEvent,
        });
      } catch (error) {
        // If the event already exists, update it instead of throwing an error
        if (error instanceof ConflictError) {
          return await this.updateEvent(calendar, event.id, event);
        }

        throw error;
      }
    });
  }

  async updateEvent(
    calendar: Calendar,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("updateEvent", async () => {
      const existingEvent = await this.client.calendars.events.retrieve(
        eventId,
        {
          calendarId: calendar.id,
        },
      );

      let eventToUpdate = {
        ...existingEvent,
        calendarId: calendar.id,
        ...toGoogleCalendarEvent(event),
      };

      // Handle response status update within the same call for Google Calendar
      if (event.response && event.response.status !== "unknown") {
        if (!existingEvent.attendees) {
          throw new Error("Event has no attendees");
        }

        const selfIndex = existingEvent.attendees.findIndex(
          (attendee) => attendee.self,
        );

        if (selfIndex === -1) {
          throw new Error("User is not an attendee");
        }

        const updatedAttendees = [...existingEvent.attendees];
        updatedAttendees[selfIndex] = {
          ...updatedAttendees[selfIndex],
          responseStatus: toGoogleCalendarAttendeeResponseStatus(
            event.response.status,
          ),
        };

        eventToUpdate = {
          ...eventToUpdate,
          attendees: updatedAttendees,
          sendUpdates: event.response.sendUpdate ? "all" : "none",
        };
      }

      const updatedEvent = await this.client.calendars.events.update(
        eventId,
        eventToUpdate,
        // TODO: Handle conflicts gracefully
        // event.etag ? { headers: { "If-Match": event.etag } } : undefined,
      );

      return parseGoogleCalendarEvent({
        calendar,
        accountId: this.accountId,
        event: updatedEvent,
      });
    });
  }

  async deleteEvent(
    calendarId: string,
    eventId: string,
    sendUpdate: boolean,
  ): Promise<void> {
    return this.withErrorHandler("deleteEvent", async () => {
      await this.client.calendars.events.delete(eventId, {
        calendarId,
        sendUpdates: sendUpdate ? "all" : "none",
      });
    });
  }

  async moveEvent(
    sourceCalendar: Calendar,
    destinationCalendar: Calendar,
    eventId: string,
    sendUpdate: boolean = true,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("moveEvent", async () => {
      const moved = await this.client.calendars.events.move(eventId, {
        calendarId: sourceCalendar.id,
        destination: destinationCalendar.id,
        sendUpdates: sendUpdate ? "all" : "none",
      });

      return parseGoogleCalendarEvent({
        calendar: destinationCalendar,
        accountId: this.accountId,
        event: moved,
      });
    });
  }

  async acceptEvent(calendarId: string, eventId: string): Promise<void> {
    return this.withErrorHandler("acceptEvent", async () => {
      const event = await this.client.calendars.events.retrieve(eventId, {
        calendarId,
      });

      const attendees = event.attendees ?? [];
      const selfIndex = attendees.findIndex((a) => a.self);

      if (selfIndex >= 0) {
        attendees[selfIndex] = {
          ...attendees[selfIndex],
          responseStatus: "accepted",
        };
      } else {
        attendees.push({ self: true, responseStatus: "accepted" });
      }

      await this.client.calendars.events.update(eventId, {
        ...event,
        calendarId,
        attendees,
        sendUpdates: "all",
      });
    });
  }

  async responseToEvent(
    calendarId: string,
    eventId: string,
    response: ResponseToEventInput,
  ): Promise<void> {
    return this.withErrorHandler("responseToEvent", async () => {
      if (response.status === "unknown") {
        return;
      }

      const event = await this.client.calendars.events.retrieve(eventId, {
        calendarId,
      });

      if (!event.attendees) {
        throw new Error("Event has no attendees");
      }

      const selfIndex = event.attendees.findIndex((attendee) => attendee.self);

      if (selfIndex === -1) {
        throw new Error("User is not an attendee");
      }

      event.attendees[selfIndex] = {
        ...event.attendees[selfIndex],
        responseStatus: toGoogleCalendarAttendeeResponseStatus(response.status),
      };

      await this.client.calendars.events.update(eventId, {
        ...event,
        calendarId,
        sendUpdates: response.sendUpdate ? "all" : "none",
      });
    });
  }

  async freeBusy(
    schedules: string[],
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarFreeBusy[]> {
    return this.withErrorHandler("freeBusy", async () => {
      const response = await this.client.checkFreeBusy.checkFreeBusy({
        timeMin: timeMin.withTimeZone("UTC").toInstant().toString(),
        timeMax: timeMax.withTimeZone("UTC").toInstant().toString(),
        timeZone: "UTC",
        items: schedules.map((id) => ({ id })),
      });

      return parseGoogleCalendarFreeBusy(response);
    });
  }

  private async withErrorHandler<T>(
    operation: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>,
    retryAttempt: number = 0,
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      if (error instanceof AuthenticationError && retryAttempt === 0) {
        console.warn(
          `Authentication error in ${operation}, attempting token refresh for account ${this.accountId}`,
        );

        try {
          const newAccessToken = await refreshGoogleAccessToken({
            accountId: this.accountId,
          });

          this.client = new GoogleCalendar({
            accessToken: newAccessToken,
          });

          console.info(
            `Successfully refreshed token for account ${this.accountId}, retrying ${operation}`,
          );
          return await this.withErrorHandler(
            operation,
            fn,
            context,
            retryAttempt + 1,
          );
        } catch (refreshError) {
          console.error(
            `Failed to refresh token for account ${this.accountId}:`,
            refreshError,
          );
          throw new ProviderError(
            refreshError as Error,
            `${operation}_token_refresh`,
            {
              ...context,
              originalError: error,
              accountId: this.accountId,
            },
          );
        }
      }

      console.error(`Failed to ${operation}:`, error);
      throw new ProviderError(error as Error, operation, {
        ...context,
        accountId: this.accountId,
        retryAttempt,
      });
    }
  }
}
