import { createCollection } from "@tanstack/react-db";
import { and, eq } from "drizzle-orm";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { jotaiStore } from "@/atoms/store";
import { getDifferences } from "@/components/calendar/flows/event-form/merge-changes";
import { serializeEvent } from "@/lib/db";
import { trpc } from "@/lib/trpc/client";
import { calendars, events } from "../../drizzle/schema";
import { client, db } from "../client";
import { drizzleCollectionOptions } from "../drizzle";
import { runMigrations } from "../migrations";
import { calendarCollection } from "./calendars";

type EventRow = typeof events.$inferSelect;

function changed(existing: EventRow, incoming: EventRow): boolean {
  return getDifferences(existing, incoming).length > 0;
}

const eventCollectionConfig = drizzleCollectionOptions({
  db,
  table: events,
  primaryColumn: events.id,
  getKey: (event) =>
    `${event.providerAccountId}-${event.calendarId}-${event.id}`,
  startSync: true,
  prepare: async () => {
    await client.waitReady;

    await runMigrations(client);
  },
  sync: async ({ collection, write }) => {
    await calendarCollection.stateWhenReady();

    const timeZone = jotaiStore.get(calendarSettingsAtom).defaultTimeZone;

    const existingEvents = collection.toArray;

    const localEvents = new Map(
      existingEvents.map((event) => [collection.getKeyFromItem(event), event]),
    );

    const syncableCalendars = await db
      .select({
        providerId: calendars.providerId,
        providerAccountId: calendars.providerAccountId,
        calendarId: calendars.id,
        syncToken: calendars.syncToken,
      })
      .from(calendars)
      .where(and(eq(calendars.providerId, "google")));

    await Promise.all(
      syncableCalendars.map(async (calendar) => {
        const { changes, syncToken, status } = await trpc.events.sync.query({
          calendar: {
            ...calendar,
            syncToken: calendar.syncToken ?? undefined,
          },
          timeZone,
        });

        if (status === "full") {
          const keysToDelete = existingEvents
            .filter(
              (event) =>
                event.providerAccountId === calendar.providerAccountId &&
                event.calendarId === calendar.calendarId,
            )
            .map((event) => collection.getKeyFromItem(event));

          for (const key of keysToDelete) {
            write({ type: "delete", value: localEvents.get(key)! });

            localEvents.delete(key);
          }
        }

        for (const change of changes) {
          const eventKey = `${change.event.accountId}-${change.event.calendarId}-${change.event.id}`;
          const existing = localEvents.get(eventKey);

          if (change.status === "deleted") {
            if (existing) {
              write({ type: "delete", value: existing });

              localEvents.delete(eventKey);
            }

            continue;
          }

          const value = serializeEvent(change.event);

          if (!existing) {
            write({ type: "insert", value });

            localEvents.set(eventKey, value);

            continue;
          }

          if (!changed(existing, value)) {
            continue;
          }

          write({ type: "update", value });

          localEvents.set(eventKey, value);
        }

        await db
          .update(calendars)
          .set({ syncToken })
          .where(
            and(
              eq(calendars.id, calendar.calendarId),
              eq(calendars.providerId, calendar.providerId),
              eq(calendars.providerAccountId, calendar.providerAccountId),
            ),
          );
      }),
    );
  },
});

export const eventsCollection = createCollection(eventCollectionConfig);
