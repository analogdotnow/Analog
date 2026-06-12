import type {
  DefaultCalendarCalendarViewDeltaInput,
  DefaultCalendarCreateEventInput,
  DefaultCalendarDeleteEventInput,
  DefaultCalendarGetEventInput,
  DefaultCalendarListEventInput,
  DefaultCalendarUpdateEventInput,
  DeltaCollectionResponse,
  Event as MicrosoftEvent,
  MicrosoftCalendar,
} from "@analog/microsoft-calendar";

import type { CalendarEventSyncItem } from "../../../interfaces";
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
import { parseMicrosoftEvent, toMicrosoftEvent } from "./utils";

const MAX_EVENTS_PER_CALENDAR = 250;

export class MicrosoftCalendarEvents implements CalendarProviderEvents {
  constructor(private readonly client: MicrosoftCalendar) {}

  // "primary" is an app-level alias for the default calendar, which Graph
  // addresses via /me/calendar instead of /me/calendars/{id}.
  private eventsFor(calendarId: string) {
    if (calendarId === "primary") {
      return this.client.users.calendar.events;
    }

    const events = this.client.users.calendars.events;

    return {
      list: (params: DefaultCalendarListEventInput) =>
        events.list({ ...params, calendarId }),
      get: (params: DefaultCalendarGetEventInput) =>
        events.get({ ...params, calendarId }),
      create: (params: DefaultCalendarCreateEventInput) =>
        events.create({ ...params, calendarId }),
      update: (params: DefaultCalendarUpdateEventInput) =>
        events.update({ ...params, calendarId }),
      delete: (params: DefaultCalendarDeleteEventInput) =>
        events.delete({ ...params, calendarId }),
    };
  }

  private calendarViewFor(calendarId: string) {
    if (calendarId === "primary") {
      return this.client.users.calendar.calendarView;
    }

    const calendarView = this.client.users.calendars.calendarView;

    return {
      delta: (params: DefaultCalendarCalendarViewDeltaInput) =>
        calendarView.delta({ ...params, calendarId }),
    };
  }

  async list({
    calendar,
    timeMin,
    timeMax,
    timeZone,
  }: CalendarProviderEventsListOptions) {
    return this.withErrorHandler("events.list", async () => {
      const startTime = timeMin.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax.withTimeZone("UTC").toInstant().toString();

      const filter = `start/dateTime ge '${startTime}' and end/dateTime le '${endTime}'`;
      const headers = { Prefer: `outlook.timezone="${timeZone ?? "UTC"}"` };

      const response = await this.eventsFor(calendar.id).list({
        userId: "me",
        filter,
        orderby: ["start/dateTime"],
        top: MAX_EVENTS_PER_CALENDAR,
        headers,
      });

      const events = (response.value ?? []).map((event) =>
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

      const headers = { Prefer: `outlook.timezone="${timeZone}"` };

      let syncToken: string | undefined;
      let pageToken: string | undefined;

      const changes: CalendarEventSyncItem[] = [];

      do {
        const link = pageToken ?? initialSyncToken;

        let response: DeltaCollectionResponse<MicrosoftEvent>;

        if (link) {
          response = await this.client.get<
            DeltaCollectionResponse<MicrosoftEvent>
          >(link, undefined, undefined, headers);
        } else {
          if (!startTime || !endTime) {
            throw new Error(
              "timeMin and timeMax are required for an initial sync",
            );
          }

          response = await this.calendarViewFor(calendar.id).delta({
            userId: "me",
            startDateTime: startTime,
            endDateTime: endTime,
            orderby: ["start/dateTime"],
            top: MAX_EVENTS_PER_CALENDAR,
            headers,
          });
        }

        for (const item of response.value ?? []) {
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

        pageToken = response["@odata.nextLink"] ?? undefined;
        syncToken = response["@odata.deltaLink"] ?? undefined;
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
      const headers = { Prefer: `outlook.timezone="${timeZone ?? "UTC"}"` };

      const event = await this.eventsFor(calendar.id).get({
        userId: "me",
        eventId,
        headers,
      });

      return parseMicrosoftEvent({
        event,
        calendar,
      });
    });
  }

  async create({ calendar, event }: CalendarProviderEventsCreateOptions) {
    return this.withErrorHandler("events.create", async () => {
      const createdEvent = await this.eventsFor(calendar.id).create({
        userId: "me",
        event: toMicrosoftEvent(event),
      });

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
      // TODO: Handle conflicts gracefully via If-Match with event.etag
      const updatedEvent = await this.eventsFor(calendar.id).update({
        userId: "me",
        eventId,
        event: toMicrosoftEvent(event),
      });

      // Then, handle response status update if present (Microsoft-specific approach)
      if (event.response && event.response.status !== "unknown") {
        await this.respondToEvent(eventId, event.response.status, {
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
      await this.eventsFor(calendarId).delete({ userId: "me", eventId });
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

      await this.respondToEvent(eventId, response.status, {
        comment: response.comment,
        sendResponse: response.sendUpdate,
      });
    });
  }

  private async respondToEvent(
    eventId: string,
    status: "accepted" | "tentative" | "declined",
    options: { comment?: string | null; sendResponse?: boolean | null },
  ): Promise<void> {
    if (status === "accepted") {
      await this.client.users.events.accept({
        userId: "me",
        eventId,
        comment: options.comment,
        sendResponse: options.sendResponse,
      });

      return;
    }

    if (status === "tentative") {
      await this.client.users.events.tentativelyAccept({
        userId: "me",
        eventId,
        comment: options.comment,
        sendResponse: options.sendResponse,
      });

      return;
    }

    await this.client.users.events.decline({
      userId: "me",
      eventId,
      comment: options.comment,
      sendResponse: options.sendResponse,
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
