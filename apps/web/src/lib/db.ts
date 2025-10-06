import * as React from "react";
import { eq, like, useLiveQuery } from "@tanstack/react-db";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import type { CalendarEvent } from "./interfaces";
import { client } from "./pglite/client";
import { calendarCollection } from "./pglite/collections/calendars";
import { eventsCollection } from "./pglite/collections/events";
import {
  deserializeEvent,
  serializeEvent,
} from "./pglite/collections/events/utils";

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
    const existing = eventsCollection.get(event.id);

    if (!existing) {
      const tx = eventsCollection.insert(event);
      await tx.isPersisted.promise;
    } else {
      const tx = eventsCollection.update(event.id, (draft) => {
        Object.assign(draft, event);
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

  return cached;
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
    const event = data[0];

    if (!event) {
      return undefined;
    }

    return event as CalendarEvent;
  }, [data]);
}
