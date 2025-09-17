"use client";

import { createCollection } from "@tanstack/react-db";
import { eq } from "drizzle-orm";
import { drizzleCollectionOptions } from "./drizzle";
import { Temporal } from "temporal-polyfill";

import { calendars, events } from "../drizzle/schema";
import { trpc } from "../trpc/client";
import { ensurePgliteReady, getDrizzleDb } from "./client";
import { serializeEvent } from "../db";
export type CalendarRow = typeof calendars.$inferSelect;
export type CalendarInsert = typeof calendars.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;

const db = getDrizzleDb();

type CalendarsSyncResult = Awaited<
  ReturnType<(typeof trpc.calendars.sync)["query"]>
>;

function normalizeCalendar(calendar: CalendarsSyncResult[number]): CalendarRow {
  return {
    ...calendar,
    description: calendar.description ?? null,
    etag: calendar.etag ?? null,
    timeZone: calendar.timeZone ?? null,
    color: calendar.color ?? null,
    syncToken: calendar.syncToken ?? null,
  };
}

async function syncWithCloud(): Promise<CalendarRow[]> {
  const result = await trpc.calendars.sync.query();

  return result.map(normalizeCalendar);
}

async function getSyncState() {
  const res = await db.select().from(calendars);

  return res.flat().reduce(
    (acc, item) => {
      if (item.syncToken != null) {
        acc[item.id] = item.syncToken;
      }

      return acc;
    },
    {} as Record<string, string | undefined>,
  );
}

async function updateSyncState(syncTokens: Record<string, string | undefined>) {
  for (const [id, syncToken] of Object.entries(syncTokens)) {
    await db
      .update(calendars)
      .set({
        syncToken,
      })
      .where(eq(calendars.id, id));
  }
}

async function syncEvents() {
  const state = await getSyncState();

  console.log("SYNCING EVENTS", JSON.stringify(state, null, 2));
  const { events, syncTokens } = await trpc.events.sync.query({
    timeMin: Temporal.Now.zonedDateTimeISO().subtract({ days: 30 }),
    timeMax: Temporal.Now.zonedDateTimeISO().add({ days: 30 }),
    state,
    timeZone: "UTC",
  });

  await updateSyncState(syncTokens);

  return events;
}

const calendarCollectionConfig = drizzleCollectionOptions({
  // startSync: false,
  db,
  table: calendars,
  primaryColumn: calendars.id,
  prepare: ensurePgliteReady,
  sync: async ({ collection, write }) => {
    const remote = await syncWithCloud();
    const local = new Map(
      collection.toArray.map((calendar) => [
        collection.getKeyFromItem(calendar),
        calendar,
      ]),
    );

    const seen = new Set<string>();

    for (const calendar of remote) {
      const key = collection.getKeyFromItem(calendar);
      const type = local.has(key) ? "update" : "insert";

      seen.add(key);
      write({ type, value: calendar });
    }


    for (const [key, calendar] of local.entries()) {
      if (seen.has(key)) {
        continue;
      }

      write({ type: "delete", value: calendar });
    }
  },
});

export const calendarsCollection = createCollection({
  // startSync: true,
  id: "calendars",
  ...calendarCollectionConfig,
  getKey: (calendar) => `${calendar.accountId}-${calendar.id}`,
});

const eventCollectionConfig = drizzleCollectionOptions({
  // startSync: false,
  db,
  table: events,
  primaryColumn: events.id,
  prepare: ensurePgliteReady,
  sync: async ({ write }) => {
    const events = await syncEvents();

    for (const event of events) {
      try {
        write({
          type: "insert",
          value: serializeEvent(event),
        });
      } catch (error) {
        // Silently handle individual event insertion errors
        console.log("Error while syncing events", error);
      }
    }
  },
});

export const eventsCollection = createCollection({
  // startSync: true,
  id: "events",
  ...eventCollectionConfig,
  getKey: (event) => `${event.accountId}-${event.calendarId}-${event.id}`,
});
