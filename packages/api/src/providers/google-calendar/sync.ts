import { APIError, GoogleCalendar } from "@repo/google-calendar";

import type {
  GoogleCalendarCalendarListEntry,
  GoogleCalendarEvent,
} from "../calendars/google-calendar/interfaces";

interface BaseSyncResult {
  nextSyncToken: string | null;
}

export interface SyncCalendarListOptions {
  client: GoogleCalendar;
  syncToken: string | null;
  onUpsert: (entry: GoogleCalendarCalendarListEntry) => Promise<void> | void;
  onDelete: (calendarId: string) => Promise<void> | void;
  onInvalidSyncToken: () => Promise<void> | void;
}

export async function syncCalendarList({
  client,
  syncToken,
  onUpsert,
  onDelete,
  onInvalidSyncToken,
}: SyncCalendarListOptions): Promise<BaseSyncResult> {
  let pageToken: string | undefined = undefined;

  const perform = async (forceFullSync?: boolean) => {
    let nextSyncToken: string | null = null;

    do {
      try {
        const calendarList = await client.users.me.calendarList.list({
          ...(syncToken && !forceFullSync ? { syncToken } : {}),
          pageToken,
          maxResults: 250,
          showHidden: false,
          showDeleted: true,
          minAccessRole: "reader",
        });

        const items = calendarList.items ?? [];

        for (const entry of items) {
          if (entry.deleted) {
            await onDelete(entry.id!);
          } else {
            await onUpsert(entry);
          }
        }

        pageToken = calendarList.nextPageToken;
        nextSyncToken = calendarList.nextSyncToken ?? null;
      } catch (error: unknown) {
        if (error instanceof APIError && error.status === 410) {
          await onInvalidSyncToken();

          return null;
        }

        throw error;
      }
    } while (pageToken);

    return nextSyncToken;
  };

  let nextSyncToken = await perform();

  if (nextSyncToken) {
    return { nextSyncToken };
  }

  // Full sync
  nextSyncToken = await perform(true);

  return {
    nextSyncToken,
  };
}

export interface SyncEventsOptions {
  client: GoogleCalendar;
  calendarId: string;
  syncToken: string | null;
  timeMin?: string;
  timeMax?: string;
  onUpsert: (event: GoogleCalendarEvent) => Promise<void> | void;
  onDelete: (eventId: string) => Promise<void> | void;
  onInvalidSyncToken: () => Promise<void> | void;
}

export async function syncEvents({
  client,
  calendarId,
  syncToken,
  timeMin,
  timeMax,
  onUpsert,
  onDelete,
  onInvalidSyncToken,
}: SyncEventsOptions): Promise<BaseSyncResult> {
  let pageToken: string | undefined = undefined;

  const perform = async (forceFullSync?: boolean) => {
    let nextSyncToken: string | null = null;

    do {
      try {
        const result = await client.calendars.events.list(calendarId, {
          ...(syncToken && !forceFullSync
            ? { syncToken }
            : { timeMin, timeMax }),
          pageToken,
          maxResults: 2500,
          singleEvents: true,
          showDeleted: true,
        });

        const items = result.items ?? [];

        for (const event of items) {
          if (event.status === "cancelled") {
            await onDelete(event.id!);
          } else {
            await onUpsert(event);
          }
        }

        pageToken = result.nextPageToken;
        nextSyncToken = result.nextSyncToken ?? null;
      } catch (error: unknown) {
        if (error instanceof APIError && error.status === 410) {
          await onInvalidSyncToken();

          return null;
        }

        throw error;
      }
    } while (pageToken);

    return nextSyncToken;
  };

  let nextSyncToken = await perform();

  if (nextSyncToken) {
    return { nextSyncToken };
  }

  // Full sync
  nextSyncToken = await perform(true);

  return { nextSyncToken };
}
