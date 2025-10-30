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
import { ProviderError, ResourceDeletedError } from "../lib/provider-error";
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
    return this.withErrorHandler("events", async () => {
      const { items } = await this.client.calendars.events.list(calendar.id, {
        timeMin: timeMin.withTimeZone("UTC").toInstant().toString(),
        timeMax: timeMax.withTimeZone("UTC").toInstant().toString(),
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

      // Fetch master events individually and filter out deleted ones
      const masterResults = await Promise.allSettled(
        Array.from(masters).map((id) => this.event(calendar, id, timeZone)),
      );

      const recurringMasterEvents: CalendarEvent[] = [];

      for (const result of masterResults) {
        if (result.status === "fulfilled") {
          recurringMasterEvents.push(result.value);
        } else if (result.reason instanceof ResourceDeletedError) {
          // Log but don't fail - the master event was deleted
          console.info(`Recurring master event was deleted, skipping:`, {
            calendarId: calendar.id,
            error: result.reason.message,
          });
        } else {
          // Re-throw non-deletion errors
          throw result.reason;
        }
      }

      return { events, recurringMasterEvents };
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

      // Fetch events individually and filter out deleted ones
      const results = await Promise.allSettled(
        Array.from(map).map((id) => this.event(calendar, id, timeZone)),
      );

      const successfulEvents: CalendarEvent[] = [];

      for (const result of results) {
        if (result.status === "fulfilled") {
          successfulEvents.push(result.value);
        } else if (result.reason instanceof ResourceDeletedError) {
          // Log but don't fail - the event was deleted
          console.info(`Recurring event was deleted, skipping:`, {
            calendarId: calendar.id,
            error: result.reason.message,
          });
        } else {
          // Re-throw non-deletion errors
          throw result.reason;
        }
      }

      return successfulEvents;
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
      let existingEvent;
      try {
        existingEvent = await this.client.calendars.events.retrieve(
          eventId,
          {
            calendarId: calendar.id,
          },
        );
      } catch (error) {
        // If the event was deleted, throw a more specific error
        if (this.isResourceDeletedError(error)) {
          throw new ResourceDeletedError("updateEvent", {
            calendarId: calendar.id,
            eventId,
          });
        }
        throw error;
      }

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
      let event;
      try {
        event = await this.client.calendars.events.retrieve(eventId, {
          calendarId,
        });
      } catch (error) {
        // If the event was deleted, throw a more specific error
        if (this.isResourceDeletedError(error)) {
          throw new ResourceDeletedError("acceptEvent", {
            calendarId,
            eventId,
          });
        }
        throw error;
      }

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

      let event;
      try {
        event = await this.client.calendars.events.retrieve(eventId, {
          calendarId,
        });
      } catch (error) {
        // If the event was deleted, throw a more specific error
        if (this.isResourceDeletedError(error)) {
          throw new ResourceDeletedError("responseToEvent", {
            calendarId,
            eventId,
          });
        }
        throw error;
      }

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
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      // Check if this is a 410 (Gone) error indicating the resource has been deleted
      if (this.isResourceDeletedError(error)) {
        console.warn(`Resource deleted during ${operation}:`, {
          operation,
          context,
          error: error instanceof Error ? error.message : String(error),
        });
        throw new ResourceDeletedError(operation, context);
      }

      console.error(`Failed to ${operation}:`, error);

      throw new ProviderError(error as Error, operation, context);
    }
  }

  private isResourceDeletedError(error: unknown): boolean {
    if (!(error instanceof APIError)) {
      return false;
    }

    // Check for 410 Gone status with "deleted" reason
    if (error.status === 410) {
      const details =
        (error.error as { errors?: Array<{ reason?: string }> })?.errors ?? [];

      // If the error explicitly states the resource was deleted, it's a resource deletion
      if (details.some(({ reason }) => reason === "deleted")) {
        return true;
      }
    }

    return false;
  }

  private isFullSyncRequiredError(error: unknown): boolean {
    if (!(error instanceof APIError)) {
      return false;
    }

    if (error.status === 410) {
      const details =
        (error.error as { errors?: Array<{ reason?: string }> })?.errors ?? [];

      // Only treat as full sync required if not explicitly a deletion
      // or if the reason is fullSyncRequired
      if (details.some(({ reason }) => reason === "fullSyncRequired")) {
        return true;
      }

      // For 410 without explicit "deleted" reason, treat as full sync required
      if (!details.some(({ reason }) => reason === "deleted")) {
        return true;
      }
    }

    return false;
  }
}
