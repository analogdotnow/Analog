import "server-only";

import { Client } from "@microsoft/microsoft-graph-client";
import type {
  Calendar as MicrosoftCalendar,
  ScheduleInformation,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import type {
  CreateCalendarInput,
  CreateEventInput,
  UpdateCalendarInput,
  UpdateEventInput,
} from "@repo/schemas";

import type {
  Calendar,
  CalendarEvent,
  CalendarEventSyncItem,
  CalendarFreeBusy,
  CalendarProviderSyncOptions,
} from "../interfaces";
import type {
  CalendarProvider,
  ResponseToEventInput,
} from "../interfaces/providers";
import { ProviderError } from "../lib/provider-error";
import { parseCalendar } from "./microsoft-calendar/calendars";
import { formatDate, formatEvent } from "./microsoft-calendar/events/format";
import { parseEvent } from "./microsoft-calendar/events/parse";
import { parseScheduleItem } from "./microsoft-calendar/freebusy";
import type { MicrosoftEvent } from "./microsoft-calendar/interfaces";
import {
  calendarPath,
  eventResponseStatusPath,
} from "./microsoft-calendar/utils";

const MAX_EVENTS_PER_CALENDAR = 250;

interface MicrosoftCalendarProviderOptions {
  accessToken: string;
  providerAccountId: string;
}

export class MicrosoftCalendarProvider implements CalendarProvider {
  public readonly providerId = "microsoft" as const;
  public readonly providerAccountId: string;
  private graphClient: Client;

  constructor({
    accessToken,
    providerAccountId,
  }: MicrosoftCalendarProviderOptions) {
    this.providerAccountId = providerAccountId;
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
        .api(
          "/me/calendars?$select=id,name,isDefaultCalendar,canEdit,hexColor,isRemovable,owner,calendarPermissions",
        )
        .get();

      return (response.value as MicrosoftCalendar[]).map((calendar) => ({
        ...parseCalendar({
          calendar,
          providerAccountId: this.providerAccountId,
        }),
      }));
    });
  }

  async calendar(calendarId: string): Promise<Calendar> {
    return this.withErrorHandler("calendar", async () => {
      const calendar = (await this.graphClient
        .api(calendarPath(calendarId))
        .select(
          "id,name,isDefaultCalendar,canEdit,hexColor,owner,calendarPermissions",
        )
        .get()) as MicrosoftCalendar;

      return parseCalendar({
        calendar,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  async createCalendar(calendar: CreateCalendarInput): Promise<Calendar> {
    return this.withErrorHandler("createCalendar", async () => {
      const createdCalendar: MicrosoftCalendar = await this.graphClient
        .api("/me/calendars")
        .post({
          name: calendar.name,
        });

      return parseCalendar({
        calendar: createdCalendar,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  async updateCalendar(
    calendarId: string,
    calendar: UpdateCalendarInput,
  ): Promise<Calendar> {
    return this.withErrorHandler("updateCalendar", async () => {
      const updatedCalendar: MicrosoftCalendar = await this.graphClient
        .api(calendarPath(calendarId))
        .patch(calendar);

      return parseCalendar({
        calendar: updatedCalendar,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  async deleteCalendar(calendarId: string): Promise<void> {
    return this.withErrorHandler("deleteCalendar", async () => {
      await this.graphClient.api(calendarPath(calendarId)).delete();
    });
  }

  async events(
    calendar: Calendar,
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
    timeZone: string,
  ): Promise<{
    events: CalendarEvent[];
    recurringMasterEvents: CalendarEvent[];
  }> {
    return this.withErrorHandler("events", async () => {
      const startTime = timeMin.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax.withTimeZone("UTC").toInstant().toString();

      const response = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events`)
        .header("Prefer", `outlook.timezone="${timeZone}"`)
        .filter(
          `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
        )
        .orderby("start/dateTime")
        .top(MAX_EVENTS_PER_CALENDAR)
        .get();

      const events = (response.value as MicrosoftEvent[]).map(
        (event: MicrosoftEvent) => parseEvent({ event, calendar }),
      );

      const instances = events.filter((e) => e.recurringEventId);
      const masters = new Set<string>([]);

      for (const instance of instances) {
        masters.add(instance.recurringEventId!);
      }

      if (masters.size === 0) {
        return { events, recurringMasterEvents: [] };
      }

      const recurringMasterEvents = await this.recurringEvents(
        calendar,
        Array.from(masters),
        timeZone,
      );

      return { events, recurringMasterEvents };
    });
  }

  async recurringEvents(
    calendar: Calendar,
    recurringEventIds: string[],
    timeZone: string,
  ): Promise<CalendarEvent[]> {
    return this.withErrorHandler("recurringEvents", async () => {
      const uniqueIds = new Set<string>(recurringEventIds);

      if (uniqueIds.size === 0) {
        return [];
      }

      return Promise.all(
        Array.from(uniqueIds).map((id) => this.event(calendar, id, timeZone)),
      );
    });
  }

  async sync({
    calendar,
    initialSyncToken,
    timeMin,
    timeMax,
    timeZone,
  }: CalendarProviderSyncOptions): Promise<{
    changes: CalendarEventSyncItem[];
    syncToken: string | undefined;
    status: "incremental" | "full";
  }> {
    const runSync = async (token: string | undefined) => {
      const startTime = timeMin?.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax?.withTimeZone("UTC").toInstant().toString();

      let syncToken: string | undefined;
      let pageToken: string | undefined = undefined;

      const baseUrl = new URL(
        `${calendarPath(calendar.id)}/calendarView/delta`,
      );

      if (startTime) {
        baseUrl.searchParams.set("startDateTime", startTime);
      }

      if (endTime) {
        baseUrl.searchParams.set("endDateTime", endTime);
      }

      const changes: CalendarEventSyncItem[] = [];

      do {
        const url: string = pageToken ?? token ?? baseUrl.toString();

        const response = await this.graphClient
          .api(url)
          .header("Prefer", `outlook.timezone="${timeZone}"`)
          .orderby("start/dateTime")
          .top(MAX_EVENTS_PER_CALENDAR)
          .get();

        for (const item of response.value as MicrosoftEvent[]) {
          if (!item?.id) {
            continue;
          }

          if (item["@removed"]) {
            changes.push({
              status: "deleted",
              event: {
                id: item.id,
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
            event: parseEvent({
              event: item,
              calendar,
            }),
          });
        }

        pageToken = response["@odata.nextLink"];
        syncToken = response["@odata.deltaLink"];
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
        syncToken,
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

  private isFullSyncRequiredError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const err = error as { statusCode?: number; code?: string };

    if (err.statusCode === 410) {
      return true;
    }

    if (err.code === "syncStateNotFound" || err.code === "resyncRequired") {
      return true;
    }

    return false;
  }

  async event(
    calendar: Calendar,
    eventId: string,
    timeZone: string,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("event", async () => {
      const event: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events/${eventId}`)
        .header("Prefer", `outlook.timezone="${timeZone}"`)
        .get();

      return parseEvent({
        event,
        calendar,
      });
    });
  }

  async createEvent(
    calendar: Calendar,
    event: CreateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("createEvent", async () => {
      const createdEvent: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events`)
        .post(formatEvent(event));

      return parseEvent({
        event: createdEvent,
        calendar,
      });
    });
  }

  async updateEvent(
    calendar: Calendar,
    eventId: string,
    event: UpdateEventInput,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("updateEvent", async () => {
      // First, perform the regular event update
      const updatedEvent: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events/${eventId}`)
        // TODO: Handle conflicts gracefully
        // .headers({
        //   ...(event.etag ? { "If-Match": event.etag } : {}),
        // })
        .patch(formatEvent(event));

      // Then, handle response status update if present (Microsoft-specific approach)
      if (event.response && event.response.status !== "unknown") {
        await this.graphClient
          .api(
            `/me/events/${eventId}/${eventResponseStatusPath(event.response.status)}`,
          )
          .post({
            comment: event.response.comment,
            sendResponse: event.response.sendUpdate,
          });
      }

      return parseEvent({
        event: updatedEvent,
        calendar,
      });
    });
  }

  /**
   * Deletes an event from the calendar
   *
   * @param calendarId - The calendar identifier
   * @param eventId - The event identifier
   * @param sendUpdate - Whether to notify attendees (cancels the event if true)
   */
  async deleteEvent(
    calendarId: string,
    eventId: string,
    sendUpdate: boolean = true,
  ): Promise<void> {
    await this.withErrorHandler("deleteEvent", async () => {
      if (sendUpdate) {
        try {
          await this.graphClient
            .api(`${calendarPath(calendarId)}/events/${eventId}/cancel`)
            .post({});
        } catch {
          await this.graphClient
            .api(`${calendarPath(calendarId)}/events/${eventId}`)
            .delete();
        }
      } else {
        await this.graphClient
          .api(`${calendarPath(calendarId)}/events/${eventId}`)
          .delete();
      }
    });
  }

  async moveEvent(
    sourceCalendar: Calendar,
    destinationCalendar: Calendar,
    eventId: string,
    sendUpdate: boolean = true,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("moveEvent", async () => {
      const sourceEvent: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(sourceCalendar.id)}/events/${eventId}`)
        .header("Prefer", `outlook.timezone="UTC"`)
        .get();

      const createdEvent: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(destinationCalendar.id)}/events`)
        .post(sourceEvent);

      await this.graphClient
        .api(`${calendarPath(sourceCalendar.id)}/events/${eventId}`)
        .header("Prefer", sendUpdate ? "" : "return=minimal")
        .delete();

      return parseEvent({
        event: createdEvent,
        calendar: destinationCalendar,
      });
    });
  }

  async responseToEvent(
    calendarId: string,
    eventId: string,
    response: ResponseToEventInput,
  ): Promise<void> {
    await this.withErrorHandler("responseToEvent", async () => {
      if (response.status === "unknown") {
        return;
      }

      await this.graphClient
        .api(
          `/me/events/${eventId}/${eventResponseStatusPath(response.status)}`,
        )
        .post({ comment: response.comment, sendResponse: response.sendUpdate });
    });
  }

  async freeBusy(
    schedules: string[],
    timeMin: Temporal.ZonedDateTime,
    timeMax: Temporal.ZonedDateTime,
  ): Promise<CalendarFreeBusy[]> {
    return this.withErrorHandler("getSchedule", async () => {
      const response = await this.graphClient
        .api("/me/calendar/getSchedule")
        .post({
          schedules,
          startTime: formatDate({ value: timeMin }),
          endTime: formatDate({ value: timeMax }),
        });

      // TODO: Handle errors
      const data = response.value as ScheduleInformation[];

      return data.map((info) => ({
        scheduleId: info.scheduleId as string,
        busy: info.scheduleItems?.map(parseScheduleItem) ?? [],
      }));
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
