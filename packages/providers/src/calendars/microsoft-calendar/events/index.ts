import { Client } from "@microsoft/microsoft-graph-client";

import type { CalendarEventSyncItem } from "../../../interfaces";
import type {
  CalendarProviderEvents,
  CalendarProviderEventsAcceptOptions,
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
import type { MicrosoftEvent } from "../interfaces";
import { calendarPath } from "../utils";
import {
  eventResponseStatusPath,
  parseMicrosoftEvent,
  toMicrosoftEvent,
} from "./utils";

const MAX_EVENTS_PER_CALENDAR = 250;

interface MicrosoftEventsResponse {
  value: MicrosoftEvent[];
  "@odata.nextLink"?: string | undefined;
  "@odata.deltaLink"?: string | undefined;
}

export class MicrosoftCalendarEvents implements CalendarProviderEvents {
  constructor(private readonly graphClient: Client) {}

  async list({
    calendar,
    timeMin,
    timeMax,
    timeZone,
  }: CalendarProviderEventsListOptions) {
    return this.withErrorHandler("events.list", async () => {
      const startTime = timeMin.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax.withTimeZone("UTC").toInstant().toString();

      const response: MicrosoftEventsResponse = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events`)
        .header("Prefer", `outlook.timezone="${timeZone ?? "UTC"}"`)
        .filter(
          `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`,
        )
        .orderby("start/dateTime")
        .top(MAX_EVENTS_PER_CALENDAR)
        .get();

      const events = response.value.map((event) =>
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
  }: CalendarProviderSyncOptions): Promise<CalendarProviderSyncResult> {
    return this.withErrorHandler("events.sync", async () => {
      const startTime = timeMin?.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax?.withTimeZone("UTC").toInstant().toString();

      let syncToken: string | undefined;
      let pageToken: string | undefined;

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
        const url = pageToken ?? initialSyncToken ?? baseUrl.toString();
        const response: MicrosoftEventsResponse = await this.graphClient
          .api(url)
          .header("Prefer", `outlook.timezone="${timeZone}"`)
          .orderby("start/dateTime")
          .top(MAX_EVENTS_PER_CALENDAR)
          .get();

        for (const item of response.value) {
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

  async get({ calendar, eventId, timeZone }: CalendarProviderEventsGetOptions) {
    return this.withErrorHandler("events.get", async () => {
      const event: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events/${eventId}`)
        .header("Prefer", `outlook.timezone="${timeZone ?? "UTC"}"`)
        .get();

      return parseMicrosoftEvent({
        event,
        calendar,
      });
    });
  }

  async create({ calendar, event }: CalendarProviderEventsCreateOptions) {
    return this.withErrorHandler("events.create", async () => {
      const createdEvent: MicrosoftEvent = await this.graphClient
        .api(`${calendarPath(calendar.id)}/events`)
        .post(toMicrosoftEvent(event));

      return parseMicrosoftEvent({
        event: createdEvent,
        calendar,
      });
    });
  }

  async update({
    calendar,
    eventId,
    event,
  }: CalendarProviderEventsUpdateOptions) {
    return this.withErrorHandler("events.update", async () => {
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

  async delete({ calendarId, eventId }: CalendarProviderEventsDeleteOptions) {
    await this.withErrorHandler("events.delete", async () => {
      await this.graphClient
        .api(`${calendarPath(calendarId)}/events/${eventId}`)
        .delete();
    });
  }

  async acceptEvent({ eventId }: CalendarProviderEventsAcceptOptions) {
    return this.withErrorHandler("acceptEvent", async () => {
      await this.graphClient
        .api(`/me/events/${eventId}/accept`)
        .post({ sendResponse: true });
    });
  }

  async move({
    sourceCalendar,
    destinationCalendar,
    eventId,
  }: CalendarProviderEventsMoveOptions) {
    return this.withErrorHandler("events.move", async () => {
      // Placeholder: Microsoft Graph does not have a direct move endpoint.
      // This could be implemented by creating a new event in destination and deleting the original,
      // preserving fields as needed.
      const event = await this.get({
        calendar: sourceCalendar,
        eventId,
        timeZone: "UTC",
      });

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

  async respond({ eventId, response }: CalendarProviderEventsRespondOptions) {
    await this.withErrorHandler("events.respond", async () => {
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
