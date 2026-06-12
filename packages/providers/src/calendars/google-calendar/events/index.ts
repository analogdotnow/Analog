import {
  APIError,
  ConflictError,
  GoogleCalendar,
} from "@analog/google-calendar";

import type {
  Calendar,
  CalendarEvent,
  CalendarEventSyncItem,
} from "../../../interfaces";
import type {
  CalendarProviderEvents,
  CalendarProviderEventsCreateOptions,
  CalendarProviderEventsDeleteOptions,
  CalendarProviderEventsGetOptions,
  CalendarProviderEventsListOptions,
  CalendarProviderEventsMoveOptions,
  CalendarProviderEventsRespondOptions,
  CalendarProviderEventsUpdateOptions,
  CalendarProviderSyncOptions,
  CalendarProviderSyncResult,
} from "../../../interfaces/providers";
import { ProviderError } from "../../../lib/provider-error";
import {
  attendeesWithSelfResponse,
  createEventParams,
  parseGoogleCalendarEvent,
  updateEventParams,
} from "./utils";

const MAX_EVENTS_PER_CALENDAR = 250;

export class GoogleCalendarEvents implements CalendarProviderEvents {
  constructor(private readonly client: GoogleCalendar) {}

  async list({
    calendar,
    timeMin,
    timeMax,
    timeZone,
  }: CalendarProviderEventsListOptions) {
    return this.withErrorHandler("events.list", async () => {
      const { items } = await this.client.events.list({
        calendarId: calendar.id,
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
        Array.from(masters).map((eventId) =>
          this.get({ calendar, eventId, timeZone }),
        ),
      );

      return { events, recurringMasterEvents };
    });
  }

  async sync({
    calendar,
    initialSyncToken,
    timeZone,
  }: CalendarProviderSyncOptions): Promise<CalendarProviderSyncResult> {
    const runSync = async (token: string | undefined) => {
      let currentSyncToken = token;
      let pageToken: string | undefined;

      const changes: CalendarEventSyncItem[] = [];

      do {
        const { items, nextSyncToken, nextPageToken } =
          await this.client.events.list({
            calendarId: calendar.id,
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
                calendar: {
                  id: calendar.id,
                  provider: calendar.provider,
                },
              },
            });
            continue;
          }

          changes.push({
            status: "updated",
            event: parseGoogleCalendarEvent({
              calendar,
              event,
              defaultTimeZone: timeZone,
            }),
          });
        }
      } while (pageToken);

      const recurringEventIds = changes.flatMap((change) => {
        if (change.status === "deleted") {
          return [];
        }

        if (!change.event.recurringEventId) {
          return [];
        }

        return [change.event.recurringEventId];
      });

      const recurringEvents = await this.recurringEvents(
        calendar,
        recurringEventIds,
        timeZone,
      );

      const recurringChanges: CalendarEventSyncItem[] = recurringEvents.map(
        (event) => ({
          status: "updated",
          event,
        }),
      );

      changes.push(...recurringChanges);

      return {
        changes,
        syncToken: currentSyncToken,
      };
    };

    return this.withErrorHandler("events.sync", async () => {
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

  async get({ calendar, eventId, timeZone }: CalendarProviderEventsGetOptions) {
    return this.withErrorHandler("events.get", async () => {
      const event = await this.client.events.get({
        calendarId: calendar.id,
        eventId,
      });

      return parseGoogleCalendarEvent({
        calendar,
        event,
        defaultTimeZone: timeZone ?? "UTC",
      });
    });
  }

  async create({ calendar, event }: CalendarProviderEventsCreateOptions) {
    return this.withErrorHandler("events.create", async () => {
      try {
        const createdEvent = await this.client.events.insert({
          calendarId: calendar.id,
          ...createEventParams(event),
        });

        return parseGoogleCalendarEvent({
          calendar,
          event: createdEvent,
        });
      } catch (error) {
        // If the event already exists, update it instead of throwing an error
        if (error instanceof ConflictError) {
          return await this.update({
            calendar,
            eventId: event.id,
            event,
          });
        }

        throw error;
      }
    });
  }

  async update({
    calendar,
    eventId,
    event,
  }: CalendarProviderEventsUpdateOptions) {
    return this.withErrorHandler("events.update", async () => {
      const existingEvent = await this.client.events.get({
        calendarId: calendar.id,
        eventId,
      });

      let eventToUpdate = {
        ...existingEvent,
        ...updateEventParams(event),
      };

      // Handle response status update within the same call for Google Calendar
      if (event.response && event.response.status !== "unknown") {
        eventToUpdate = {
          ...eventToUpdate,
          attendees: attendeesWithSelfResponse(
            existingEvent.attendees,
            event.response.status,
          ),
          sendUpdates: event.response.sendUpdate ? "all" : "none",
        };
      }

      // TODO: Handle conflicts gracefully via If-Match with event.etag
      const updatedEvent = await this.client.events.update({
        eventId,
        ...eventToUpdate,
      });

      return parseGoogleCalendarEvent({
        calendar,
        event: updatedEvent,
      });
    });
  }

  async delete({
    calendarId,
    eventId,
    sendUpdate,
  }: CalendarProviderEventsDeleteOptions) {
    return this.withErrorHandler("events.delete", async () => {
      await this.client.events.delete({
        calendarId,
        eventId,
        sendUpdates: sendUpdate ? "all" : "none",
      });
    });
  }

  async move({
    sourceCalendar,
    destinationCalendar,
    eventId,
    sendUpdate = true,
  }: CalendarProviderEventsMoveOptions) {
    return this.withErrorHandler("events.move", async () => {
      const moved = await this.client.events.move({
        calendarId: sourceCalendar.id,
        eventId,
        destination: destinationCalendar.id,
        sendUpdates: sendUpdate ? "all" : "none",
      });

      return parseGoogleCalendarEvent({
        calendar: destinationCalendar,
        event: moved,
      });
    });
  }

  async respond({
    calendarId,
    eventId,
    response,
  }: CalendarProviderEventsRespondOptions) {
    return this.withErrorHandler("events.respond", async () => {
      if (response.status === "unknown") {
        return;
      }

      const event = await this.client.events.get({ calendarId, eventId });

      await this.client.events.update({
        ...event,
        calendarId,
        eventId,
        attendees: attendeesWithSelfResponse(event.attendees, response.status),
        sendUpdates: response.sendUpdate ? "all" : "none",
      });
    });
  }

  private async recurringEvents(
    calendar: Calendar,
    recurringEventIds: string[],
    timeZone?: string,
  ) {
    return this.withErrorHandler("events.recurring", async () => {
      const eventIds = new Set(recurringEventIds);

      if (eventIds.size === 0) {
        return [];
      }

      return Promise.all(
        Array.from(eventIds).map((eventId) =>
          this.get({ calendar, eventId, timeZone }),
        ),
      );
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
