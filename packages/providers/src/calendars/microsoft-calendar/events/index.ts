import { APIError } from "@analog/microsoft-calendar";
import type {
  DefaultCalendarCalendarViewDeltaInput,
  DefaultCalendarCreateEventInput,
  DefaultCalendarDeleteEventInput,
  DefaultCalendarGetEventInput,
  DefaultCalendarListCalendarViewInput,
  DefaultCalendarListEventInput,
  DefaultCalendarUpdateEventInput,
  DeltaCollectionResponse,
  DeltaRemovedEvent,
  Event as MicrosoftEvent,
  ListMoreInput,
  MicrosoftCalendar,
} from "@analog/microsoft-calendar";

import type { CalendarEvent, CalendarEventSyncItem } from "../../../interfaces";
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
import { formatEvent, formatEventPatch } from "./format";
import { parseEvent } from "./parse";

const MAX_EVENTS_PER_CALENDAR = 250;
const TEXT_BODY_PREFERENCE = 'outlook.body-content-type="text"';

// Graph owns these properties; they are rejected or silently ignored when they
// are posted back, so a copied event must not carry them over. transactionId
// identifies the original create, so carrying it over would make Graph dedupe
// the copy into the source event instead of creating one.
const SERVER_OWNED_EVENT_FIELDS = new Set([
  "id",
  "changeKey",
  "iCalUId",
  "webLink",
  "createdDateTime",
  "lastModifiedDateTime",
  "seriesMasterId",
  "onlineMeeting",
  "onlineMeetingUrl",
  "transactionId",
]);

function stripServerOwnedFields(event: MicrosoftEvent): MicrosoftEvent {
  const copy = { ...event };

  for (const key of Object.keys(copy)) {
    if (key.startsWith("@odata") || SERVER_OWNED_EVENT_FIELDS.has(key)) {
      delete copy[key];
    }
  }

  return copy;
}

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
      list: (params: DefaultCalendarListCalendarViewInput) =>
        calendarView.list({ ...params, calendarId }),
      listMore: (params: ListMoreInput) => calendarView.listMore(params),
      delta: (params: DefaultCalendarCalendarViewDeltaInput) =>
        calendarView.delta({ ...params, calendarId }),
      deltaMore: (params: ListMoreInput) => calendarView.deltaMore(params),
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

      const headers = {
        Prefer: `outlook.timezone="${timeZone}", ${TEXT_BODY_PREFERENCE}`,
      };

      const listPages = async (nextLink?: string): Promise<CalendarEvent[]> => {
        if (!nextLink) {
          const response = await this.calendarViewFor(calendar.id).list({
            userId: "me",
            startDateTime: startTime,
            endDateTime: endTime,
            orderby: ["start/dateTime"],
            top: MAX_EVENTS_PER_CALENDAR,
            headers,
          });

          const events = (response.value ?? []).map((event) =>
            parseEvent({ event, calendar }),
          );

          if (!response["@odata.nextLink"]) {
            return events;
          }

          return events.concat(await listPages(response["@odata.nextLink"]));
        }

        const page = await this.calendarViewFor(calendar.id).listMore({
          nextLink,
          headers,
        });

        const events = (page.value ?? []).map((event) =>
          parseEvent({ event, calendar }),
        );

        if (!page["@odata.nextLink"]) {
          return events;
        }

        return events.concat(await listPages(page["@odata.nextLink"]));
      };

      const events = await listPages();

      const recurringEventIds = new Set<string>();

      for (const event of events) {
        if (event.recurringEventId) {
          recurringEventIds.add(event.recurringEventId);
        }
      }

      const recurringMasterEvents = await Promise.all(
        Array.from(recurringEventIds).map((eventId) =>
          this.get({ calendar, eventId, timeZone }),
        ),
      );

      return { events, recurringMasterEvents };
    });
  }

  async sync({
    calendar,
    initialSyncToken,
    timeMin,
    timeMax,
    timeZone,
  }: CalendarProviderSyncOptions): Promise<CalendarProviderSyncResult> {
    const runSync = async (token: string | undefined) => {
      const startTime = timeMin?.withTimeZone("UTC").toInstant().toString();
      const endTime = timeMax?.withTimeZone("UTC").toInstant().toString();

      const headers = {
        Prefer: `outlook.timezone="${timeZone}", ${TEXT_BODY_PREFERENCE}`,
      };

      let syncToken: string | undefined;
      let pageToken: string | undefined;

      const changes: CalendarEventSyncItem[] = [];

      do {
        const link = pageToken ?? token;

        let response: DeltaCollectionResponse<
          MicrosoftEvent | DeltaRemovedEvent
        >;

        if (link) {
          response = await this.calendarViewFor(calendar.id).deltaMore({
            nextLink: link,
            headers,
          });
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
          if (!item.id) {
            continue;
          }

          if ("@removed" in item) {
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

        pageToken = response["@odata.nextLink"] ?? undefined;
        syncToken = response["@odata.deltaLink"] ?? undefined;
      } while (pageToken);

      // The delta feed only carries the changed instances, so pull in the series
      // masters they reference unless the feed already returned them.
      const changedEventIds = new Set<string>();
      const recurringEventIds = new Set<string>();

      for (const change of changes) {
        if (change.status === "deleted") {
          continue;
        }

        changedEventIds.add(change.event.id);

        if (change.event.recurringEventId) {
          recurringEventIds.add(change.event.recurringEventId);
        }
      }

      const recurringMasterEvents = await Promise.all(
        Array.from(recurringEventIds)
          .filter((eventId) => !changedEventIds.has(eventId))
          .map((eventId) => this.get({ calendar, eventId, timeZone })),
      );

      const recurringChanges: CalendarEventSyncItem[] =
        recurringMasterEvents.map((event) => ({
          status: "updated",
          event,
        }));

      changes.push(...recurringChanges);

      return {
        changes,
        syncToken,
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

        // A full sync needs an explicit window; without one the retry can only
        // fail with the generic guard below, which would hide the resync
        // signal the caller has to act on.
        if (!timeMin || !timeMax) {
          throw error;
        }

        const result = await runSync(undefined);

        // Assume if the new sync token is equal to the initial sync token,
        // content hasn't changed
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

  // Graph expires and invalidates delta tokens; the 410 status and the sync
  // state error codes both mean the delta link is unusable and the calendar has
  // to be synced from scratch.
  private isFullSyncRequiredError(error: unknown): boolean {
    if (!(error instanceof APIError)) {
      return false;
    }

    if (error.status === 410) {
      return true;
    }

    return (
      error.error?.error.code === "syncStateNotFound" ||
      error.error?.error.code === "resyncRequired"
    );
  }

  async get({ calendar, eventId, timeZone }: CalendarProviderEventsGetOptions) {
    return this.withErrorHandler("events.get", async () => {
      const headers = {
        Prefer: `outlook.timezone="${timeZone ?? "UTC"}", ${TEXT_BODY_PREFERENCE}`,
      };

      const event = await this.eventsFor(calendar.id).get({
        userId: "me",
        eventId,
        headers,
      });

      return parseEvent({
        event,
        calendar,
      });
    });
  }

  async create({
    calendar,
    event,
    sendUpdate,
  }: CalendarProviderEventsCreateOptions) {
    return this.withErrorHandler("events.create", async () => {
      if (!sendUpdate) {
        throw new Error("Microsoft Calendar does not support sendUpdate=false");
      }

      const createdEvent = await this.eventsFor(calendar.id).create({
        userId: "me",
        event: formatEvent(event),
        headers: { Prefer: TEXT_BODY_PREFERENCE },
      });

      return parseEvent({
        event: createdEvent,
        calendar,
      });
    });
  }

  async update(options: CalendarProviderEventsUpdateOptions) {
    return this.withErrorHandler("events.update", async () => {
      if (options.sendUpdate === false) {
        throw new Error("Microsoft Calendar does not support sendUpdate=false");
      }

      // Graph requires recurrence.range.startDate to match the master's start
      // date; a sparse patch that changes recurrence without moving the event
      // does not carry it, so resolve it from the stored event.
      if (options.event.recurrence && !options.event.start) {
        const existingEvent = await this.get({
          calendar: options.calendar,
          eventId: options.eventId,
        });

        return this.patchEvent(options, existingEvent.start);
      }

      return this.patchEvent(options, options.event.start);
    });
  }

  private async patchEvent(
    { calendar, eventId, event }: CalendarProviderEventsUpdateOptions,
    startForRecurrence: CalendarEvent["start"] | undefined,
  ) {
    // First, perform the regular event update
    const updatedEvent = await this.eventsFor(calendar.id).update({
      userId: "me",
      eventId,
      event: formatEventPatch(event, { startForRecurrence }),
      ...(event.etag ? { ifMatch: event.etag } : {}),
      headers: { Prefer: TEXT_BODY_PREFERENCE },
    });

    // Then, handle response status update if present (Microsoft-specific approach)
    if (event.response && event.response.status !== "unknown") {
      await this.respondToEvent(eventId, event.response.status, {
        comment: event.response.comment,
        sendResponse: event.response.sendUpdate,
      });

      // The respond actions return no body and advance the changeKey, so the
      // PATCH response is stale; re-fetch to return the final server state.
      return this.get({ calendar, eventId });
    }

    return parseEvent({
      event: updatedEvent,
      calendar,
    });
  }

  async delete({
    calendarId,
    eventId,
    etag,
    sendUpdate,
  }: CalendarProviderEventsDeleteOptions) {
    await this.withErrorHandler("events.delete", async () => {
      // Deleting an organized meeting makes Graph email the attendees a
      // cancellation, and no request shape suppresses that.
      if (!sendUpdate) {
        throw new Error("Microsoft Calendar does not support sendUpdate=false");
      }

      // Cancelling is what notifies the attendees, but Graph only allows it on
      // meetings the user organizes; event ids are calendar-independent, so the
      // action is addressed through /me/events like the respond actions.
      try {
        await this.client.users.events.cancel({ userId: "me", eventId });

        return;
      } catch (error) {
        // Graph rejects the action with a client error when the event is not
        // an organized meeting: fall back to deleting the event. Auth,
        // throttling, server and network failures are transient and must
        // surface instead of silently deleting without notifying anyone.
        const status = error instanceof APIError ? error.status : undefined;

        if (
          status === undefined ||
          status < 400 ||
          status >= 500 ||
          status === 401 ||
          status === 408 ||
          status === 429
        ) {
          throw error;
        }
      }

      await this.eventsFor(calendarId).delete({
        userId: "me",
        eventId,
        ...(etag ? { ifMatch: etag } : {}),
      });
    });
  }

  async move({
    sourceCalendar,
    destinationCalendar,
    eventId,
    etag,
  }: CalendarProviderEventsMoveOptions) {
    return this.withErrorHandler("events.move", async () => {
      // Graph cannot move an event between calendars, so copy it into the
      // destination calendar and delete the original. The source is read in UTC
      // so the copy keeps the absolute times of the original.
      const sourceEvent = await this.eventsFor(sourceCalendar.id).get({
        userId: "me",
        eventId,
        headers: { Prefer: 'outlook.timezone="UTC"' },
      });

      const createdEvent = await this.eventsFor(destinationCalendar.id).create({
        userId: "me",
        event: stripServerOwnedFields(sourceEvent),
        headers: { Prefer: TEXT_BODY_PREFERENCE },
      });

      await this.eventsFor(sourceCalendar.id).delete({
        userId: "me",
        eventId,
        ...(etag ? { ifMatch: etag } : {}),
      });

      return parseEvent({
        event: createdEvent,
        calendar: destinationCalendar,
      });
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
