import * as React from "react";
import { eq } from "@tanstack/db";
import { useLiveQuery } from "@tanstack/react-db";
import type { SuperJSONResult } from "superjson";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import type { CalendarEvent } from "./interfaces";
import {
  calendarsCollection,
  ensurePgliteReady,
  eventsCollection,
  type EventRow,
} from "./pglite";
import { superjson } from "./trpc/superjson";

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

function serializeTemporal(value?: Temporal.Instant) {
  return value ? superjson.serialize(value) : null;
}

export function serializeEvent(event: CalendarEvent): EventRow {
  const start = superjson.serialize(event.start);
  const end = superjson.serialize(event.end);
  const raw = superjson.serialize(event);

  return {
    id: event.id,
    start,
    end,
    raw,
    calendarId: event.calendarId,
    accountId: event.accountId,
    providerId: event.providerId,
    providerAccountId: event.accountId,
    recurringEventId: event.recurringEventId ?? null,
    readOnly: event.readOnly,
    visibility: event.visibility ?? null,
    availability: event.availability ?? null,
    status: event.status ?? null,
    etag: event.etag ?? null,
    title: event.title ?? null,
    location: event.location ?? null,
    url: event.url ?? null,
    color: event.color ?? null,
    createdAt: serializeTemporal(event.createdAt),
    updatedAt: serializeTemporal(event.updatedAt),
    startUnix: temporalToEpochMs(event.start),
    endUnix: temporalToEpochMs(event.end),
    responseStatus: event.response?.status ?? null,
  };
}

function deserializeEvent(row: EventRow): CalendarEvent {
  const event = superjson.deserialize(
    row.raw as SuperJSONResult,
  ) as CalendarEvent;

  return event;
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

  await ensurePgliteReady();
  await calendarsCollection.stateWhenReady();
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

  await ensurePgliteReady();

  const state = await eventsCollection.stateWhenReady();
  const cached = state.get(id);

  if (!cached) {
    return undefined;
  }

  return deserializeEvent(cached);
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
