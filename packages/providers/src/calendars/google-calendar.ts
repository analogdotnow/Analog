import { Temporal } from "temporal-polyfill";

import { APIError, ConflictError, GoogleCalendar } from "@repo/google-calendar";
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
} from "../interfaces";
import type {
  CalendarProvider,
  CalendarProviderSyncOptions,
  ResponseToEventInput,
} from "../interfaces/providers";
import { ProviderError } from "../lib/provider-error";
import { parseGoogleCalendarCalendarListEntry } from "./google-calendar/calendars";
import {
  parseGoogleCalendarEvent,
  toGoogleCalendarAttendeeResponseStatus,
  toGoogleCalendarEvent,
} from "./google-calendar/events";
import { parseGoogleCalendarFreeBusy } from "./google-calendar/freebusy";

const MAX_EVENTS_PER_CALENDAR = 250;

interface GoogleCalendarProviderOptions {
  accessToken: string;
  accountId: string;
}

export class GoogleCalendarProvider implements CalendarProvider {
  public readonly providerId = "google" as const;
  public readonly accountId: string;
  private client: GoogleCalendar;

  constructor({ accessToken, accountId }: GoogleCalendarProviderOptions) {
    this.accountId = accountId;
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

  async calendar(calendarId: string): Promise<Calendar> {
    return this.withErrorHandler("calendar", async () => {
      const calendar =
        await this.client.users.me.calendarList.retrieve(calendarId);

      return parseGoogleCalendarCalendarListEntry({
        accountId: this.accountId,
        entry: calendar,
      });
    });
  }

  async createCalendar(calendar: CreateCalendarInput): Promise<Calendar> {
    return this.withErrorHandler("createCalendar", async () => {
      const createdCalendar = await this.client.calendars.create({
        summary: calendar.name,
        description: calendar.description,
        timeZone: calendar.timeZone,
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
    // Validate time range before entering error handler
    const minInstant = timeMin.withTimeZone("UTC").toInstant();
    const maxInstant = timeMax.withTimeZone("UTC").toInstant();

    if (Temporal.Instant.compare(minInstant, maxInstant) >= 0) {
      throw new Error(
        `Invalid time range: timeMin (${minInstant.toString()}) must be before timeMax (${maxInstant.toString()})`
      );
    }

    return this.withErrorHandler("events", async () => {
      const { items } = await this.client.calendars.events.list(calendar.id, {
        timeMin: minInstant.toString(),
        timeMax: maxInstant.toString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: MAX_EVENTS_PER_CALENDAR,
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
    }, {
      calendarId: calendar.id,
      timeMin: minInstant.toString(),
      timeMax: maxInstant.toString(),
    });
  }

  async recurringEvents(
    calendar: Calendar,
    recurringEventIds: string[],
    timeZone?: string,
  ): Promise<CalendarEvent[]> {
    return this.withErrorHandler("recurringEvents", async () => {
      const map = new Set<string>(recurringEventIds);

      if (map.size === 0) {
        return [];
      }

      return Promise.all(
        Array.from(map).map((id) => this.event(calendar, id, timeZone)),
      );
    });
  }

  async sync({
    calendar,
    initialSyncToken,
    timeZone,
  }: CalendarProviderSyncOptions): Promise<{
    changes: CalendarEventSyncItem[];
    syncToken: string | undefined;
    status: "incremental" | "full";
  }> {
    const runSync = async (token: string | undefined) => {
      let currentSyncToken = token;
      let pageToken: string | undefined;

      const changes: CalendarEventSyncItem[] = [];

      do {
        const { items, nextSyncToken, nextPageToken } =
          await this.client.calendars.events.list(calendar.id, {
            singleEvents: true,
            showDeleted: true,
            maxResults: MAX_EVENTS_PER_CALENDAR,
            pageToken,
            syncToken: currentSyncToken,
          });

        if (nextSyncToken) {
          currentSyncToken = nextSyncToken;
        }

        pageToken = nextPageToken;

        if (!items) {
          continue;
        }

        for (const event of items) {
          if (event.status === "cancelled") {
            changes.push({
              status: "deleted",
              event: {
                id: event.id!,
                calendarId: calendar.id,
                accountId: this.accountId,
                providerId: this.providerId,
                providerAccountId: this.accountId,
              },
            });
            continue;
          }

          const parsedEvent = parseGoogleCalendarEvent({
            calendar,
            accountId: this.accountId,
            event,
            defaultTimeZone: timeZone,
          });

          changes.push({
            status: "updated",
            event: parsedEvent,
          });
        }
      } while (pageToken);

      const instances = changes
        .filter((e) => e.status !== "deleted" && e.event.recurringEventId)
        .map(({ event }) => (event as CalendarEvent).recurringEventId!);

      const recurringEvents = await this.recurringEvents(
        calendar,
        instances,
        timeZone,
      );

      changes.push(
        ...recurringEvents.map((event) => ({
          status: "updated" as const,
          event,
        })),
      );

      return {
        changes,
        syncToken: currentSyncToken,
      };
    };

    return this.withErrorHandler("sync", async () => {
      try {
        const result = await runSync(initialSyncToken);

        return { ...result, status: "incremental" };
      } catch (error) {
        if (!this.isFullSyncRequiredError(error)) {
          throw error;
        }

        const result = await runSync(undefined);

        // KNOWN ISSUE: holiday calendars always return a 410 error, https://issuetracker.google.com/issues/372283558
        // Assume if the new sync token is equal to the initial sync token, content hasn't changed
        if (initialSyncToken === result.syncToken) {
          return {
            changes: [],
            syncToken: initialSyncToken,
            status: "incremental",
          };
        }

        return { ...result, status: "full" };
      }
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
    // Validate time range before entering error handler
    const minInstant = timeMin.withTimeZone("UTC").toInstant();
    const maxInstant = timeMax.withTimeZone("UTC").toInstant();

    if (Temporal.Instant.compare(minInstant, maxInstant) >= 0) {
      throw new Error(
        `Invalid time range: timeMin (${minInstant.toString()}) must be before timeMax (${maxInstant.toString()})`
      );
    }

    return this.withErrorHandler("freeBusy", async () => {
      const response = await this.client.checkFreeBusy.checkFreeBusy({
        timeMin: minInstant.toString(),
        timeMax: maxInstant.toString(),
        timeZone: "UTC",
        items: schedules.map((id) => ({ id })),
      });

      return parseGoogleCalendarFreeBusy(response);
    }, {
      schedules,
      timeMin: minInstant.toString(),
      timeMax: maxInstant.toString(),
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
      // Enhanced error logging for timeRangeEmpty errors
      if (error instanceof APIError) {
        const errorDetails = error.error as {
          errors?: Array<{ reason?: string; message?: string; location?: string }>
        };
        const hasTimeRangeError = errorDetails?.errors?.some(
          e => e.reason === "timeRangeEmpty"
        );

        if (hasTimeRangeError) {
          console.error(
            `Failed to ${operation}: Time range validation error.`,
            { error, context, errorDetails: errorDetails.errors }
          );
        } else {
          console.error(`Failed to ${operation}:`, error);
        }
      } else {
        console.error(`Failed to ${operation}:`, error);
      }

      throw new ProviderError(error as Error, operation, context);
    }
  }

  private isFullSyncRequiredError(error: unknown): boolean {
    if (!(error instanceof APIError)) {
      return false;
    }

    if (error.status === 410) {
      return true;
    }

    const details =
      (error.error as { errors?: Array<{ reason?: string }> })?.errors ?? [];

    return details.some(({ reason }) => reason === "fullSyncRequired");
  }
}
