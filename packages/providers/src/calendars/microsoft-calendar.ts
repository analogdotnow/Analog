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
import {
  calendarPath,
  parseMicrosoftCalendar,
} from "./microsoft-calendar/calendars";
import {
  eventResponseStatusPath,
  parseMicrosoftEvent,
  toMicrosoftDate,
  toMicrosoftEvent,
} from "./microsoft-calendar/events";
import { parseScheduleItem } from "./microsoft-calendar/freebusy";
import type { MicrosoftEvent } from "./microsoft-calendar/interfaces";

const MAX_EVENTS_PER_CALENDAR = 250;

interface MicrosoftCalendarProviderOptions {
  accessToken: string;
  providerAccountId: string;
}

export class MicrosoftCalendarProvider implements CalendarProvider {
  public readonly providerId = "microsoft" as const;
  public readonly providerAccountId: string;
  private graphClient: Client;

  constructor({ accessToken, providerAccountId }: MicrosoftCalendarProviderOptions) {
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
        ...parseMicrosoftCalendar({ calendar, providerAccountId: this.providerAccountId }),
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

      return parseMicrosoftCalendar({
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

      return parseMicrosoftCalendar({
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

      return parseMicrosoftCalendar({
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
        (event: MicrosoftEvent) =>
          parseMicrosoftEvent({ event, calendar }),
      );

      return { events, recurringMasterEvents: [] };
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
    return this.withErrorHandler("sync", async () => {
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
        const url: string = pageToken ?? initialSyncToken ?? baseUrl.toString();

        const response = await this.graphClient
          .api(url)
          .header("Prefer", `outlook.timezone="${timeZone}"`)
          .orderby("start/dateTime")
          .top(MAX_EVENTS_PER_CALENDAR)
          .get();

        // if (!initialSyncToken && !pageToken && startTime && endTime) {
        //   request.filter(
        //     `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
        //   );
        // }

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
            event: parseMicrosoftEvent({
              event: item,
              calendar,
            }),
          });
        }

        pageToken = response["@odata.nextLink"];
        syncToken = response["@odata.deltaLink"];
      } while (pageToken);

      return {
        changes,
        syncToken,
        status: "incremental",
      };
    });
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

      return parseMicrosoftEvent({
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
        .post(toMicrosoftEvent(event));

      return parseMicrosoftEvent({
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
        .patch(toMicrosoftEvent(event));

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

      return parseMicrosoftEvent({
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
   */
  async deleteEvent(
    calendarId: string,
    eventId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendUpdate: boolean = true,
  ): Promise<void> {
    await this.withErrorHandler("deleteEvent", async () => {
      await this.graphClient
        .api(`${calendarPath(calendarId)}/events/${eventId}`)
        .delete();
    });
  }

  async moveEvent(
    sourceCalendar: Calendar,
    destinationCalendar: Calendar,
    eventId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendUpdate: boolean = true,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("moveEvent", async () => {
      // Placeholder: Microsoft Graph does not have a direct move endpoint.
      // This could be implemented by creating a new event in destination and deleting the original,
      // preserving fields as needed.
      const event = await this.event(sourceCalendar, eventId, "UTC");

      return {
        ...event,
        calendar: {
          id: destinationCalendar.id,
          provider: destinationCalendar.provider,
        },
        readOnly: event.readOnly,
      };
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
      const body = {
        schedules,
        startTime: toMicrosoftDate({ value: timeMin }),
        endTime: toMicrosoftDate({ value: timeMax }),
      };

      const response = await this.graphClient
        .api("/me/calendar/getSchedule")
        .post(body);

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
