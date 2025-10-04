import * as React from "react";
import { eq, like, useLiveQuery } from "@tanstack/react-db";
import { Temporal } from "temporal-polyfill";

import { startOfDay, toDate } from "@repo/temporal";

import { events } from "./drizzle/schema";
import type { CalendarEvent } from "./interfaces";
import { client } from "./pglite/client";
import { calendarCollection } from "./pglite/collections/calendars";
import { eventsCollection } from "./pglite/collections/events";

type EventRow = typeof events.$inferSelect;

function temporalToEpochMs(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
): number {
  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO("UTC").epochMilliseconds;
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return value.withTimeZone("UTC").epochMilliseconds;
  }

  return startOfDay(value, { timeZone: "UTC" }).epochMilliseconds;
}

export function serializeEvent(event: CalendarEvent): EventRow {
  return {
    id: event.id,
    start: event.start,
    end: event.end,
    calendarId: event.calendarId,
    providerId: event.providerId,
    providerAccountId: event.accountId,
    recurringEventId: event.recurringEventId ?? null,
    readOnly: event.readOnly,
    visibility: event.visibility ?? null,
    availability: event.availability ?? null,
    status:
      (event.status as "confirmed" | "tentative" | "cancelled" | undefined) ??
      null,
    etag: event.etag ?? null,
    title: event.title ?? null,
    description: event.description ?? null,
    location: event.location ?? null,
    url: event.url ?? null,
    color: event.color ?? null,
    allDay: event.allDay ?? null,
    createdAt: event.createdAt ?? null,
    updatedAt: event.updatedAt ?? null,
    startInstant: toDate(event.start, { timeZone: "UTC" }),
    endInstant: toDate(event.end, { timeZone: "UTC" }),
    responseStatus: event.response?.status ?? null,
    attendees: event.attendees ?? null,
    metadata: event.metadata ?? null,
    conference: event.conference ?? null,
    recurrence: event.recurrence ?? null,
  };
}

function deserializeEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    start: row.start,
    end: row.end,
    calendarId: row.calendarId,
    accountId: row.providerAccountId,
    providerId: row.providerId,
    recurringEventId: row.recurringEventId ?? undefined,
    readOnly: row.readOnly,
    visibility: row.visibility ?? undefined,
    availability: row.availability ?? undefined,
    status: row.status ?? undefined,
    etag: row.etag ?? undefined,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    location: row.location ?? undefined,
    url: row.url ?? undefined,
    color: row.color ?? undefined,
    allDay: row.allDay ?? undefined,
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
    response: row.responseStatus ? { status: row.responseStatus } : undefined,
    attendees: row.attendees ?? undefined,
    metadata: row.metadata ?? undefined,
    conference: row.conference ?? undefined,
    recurrence: row.recurrence ?? undefined,
  };
}

export {
  temporalToEpochMs,
  serializeEvent as mapEventQueryInput,
  deserializeEvent as mapEventQuery,
};

export async function upsertEvents(events: CalendarEvent[]): Promise<void> {
  if (events.length === 0) {
    return;
  }

  await calendarCollection.stateWhenReady();
  await eventsCollection.stateWhenReady();

  for (const event of events) {
    const row = serializeEvent(event);
    const existing = eventsCollection.get(row.id);

    if (!existing) {
      const tx = eventsCollection.insert(row);
      await tx.isPersisted.promise;
    } else {
      const tx = eventsCollection.update(row.id, (draft) => {
        Object.assign(draft, row);
      });

      await tx.isPersisted.promise;
    }
  }
}

export async function getEventById(
  id: string,
): Promise<CalendarEvent | undefined> {
  if (!id) {
    return undefined;
  }

  await client.waitReady;

  const cached = eventsCollection.get(id);

  if (!cached) {
    return undefined;
  }

  return deserializeEvent(cached as EventRow);
}

export function useLiveEventById(id: string) {
  const { data } = useLiveQuery(
    (q) =>
      q
        .from({ event: eventsCollection })
        .where(({ event }) => eq(event.id, id)),
    [id],
  );

  return React.useMemo(() => {
    const row = data[0];

    if (!row) {
      return undefined;
    }

    return deserializeEvent(row as EventRow);
  }, [data]);
}
