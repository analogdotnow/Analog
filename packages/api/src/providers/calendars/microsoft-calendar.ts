import { Client } from "@microsoft/microsoft-graph-client";
import type {
  Calendar as MicrosoftCalendar,
  Event as MicrosoftEvent,
  ScheduleInformation,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import { CALENDAR_DEFAULTS } from "../../constants/calendar";
import type {
  Calendar,
  CalendarEvent,
  CalendarFreeBusy,
} from "../../interfaces";
import type {
  CreateCalendarInput,
  UpdateCalendarInput,
} from "../../schemas/calendars";
import type { CreateEventInput, UpdateEventInput } from "../../schemas/events";
import { ProviderError } from "../lib/provider-error";
import type { CalendarProvider, ResponseToEventInput } from "./interfaces";
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

interface MicrosoftCalendarProviderOptions {
  accessToken: string;
  accountId: string;
}

export class MicrosoftCalendarProvider implements CalendarProvider {
  public readonly providerId = "microsoft" as const;
  public readonly accountId: string;
  private graphClient: Client;

  constructor({ accessToken, accountId }: MicrosoftCalendarProviderOptions) {
    this.accountId = accountId;
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
        ...parseMicrosoftCalendar({ calendar, accountId: this.accountId }),
      }));
    });
  }

  async createCalendar(calendarData: CreateCalendarInput): Promise<Calendar> {
    return this.withErrorHandler("createCalendar", async () => {
      const createdCalendar: MicrosoftCalendar = await this.graphClient
        .api("/me/calendars")
        .post(calendarData);

      return parseMicrosoftCalendar({
        calendar: createdCalendar,
        accountId: this.accountId,
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
        accountId: this.accountId,
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
        .top(CALENDAR_DEFAULTS.MAX_EVENTS_PER_CALENDAR)
        .get();

      const events = (response.value as MicrosoftEvent[]).map(
        (event: MicrosoftEvent) =>
          parseMicrosoftEvent({ event, accountId: this.accountId, calendar }),
      );

      return { events, recurringMasterEvents: [] };
    });
  }

  async event(
    calendar: Calendar,
    eventId: string,
    timeZone?: string,
  ): Promise<CalendarEvent> {
    return this.withErrorHandler("event", async () => {
      const request = this.graphClient.api(
        `${calendarPath(calendar.id)}/events/${eventId}`,
      );

      if (timeZone) {
        request.header("Prefer", `outlook.timezone="${timeZone}"`);
      }

      const event: MicrosoftEvent = await request.get();

      return parseMicrosoftEvent({
        event,
        accountId: this.accountId,
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
        accountId: this.accountId,
        calendar,
      });
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
        accountId: this.accountId,
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
      const event = await this.event(sourceCalendar, eventId);
      return {
        ...event,
        calendarId: destinationCalendar.id,
        // Mark as readOnly to signal as placeholder behavior if needed by callers
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
