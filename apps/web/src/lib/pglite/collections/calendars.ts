import { createCollection } from "@tanstack/react-db";
import { diff } from "json-diff-ts";

import { trpc } from "@/lib/trpc/client";
import { calendars } from "../../drizzle/schema";
import { client, db } from "../client";
import { drizzleCollectionOptions } from "../drizzle";
import { runMigrations } from "../migrations";

type CalendarRow = typeof calendars.$inferSelect;

function changed(existing: CalendarRow, incoming: CalendarRow): boolean {
  const changes = diff(existing, incoming);

  const filteredChanges = changes.filter((change) => {
    if (
      change.type === "REMOVE" &&
      change.key === "primary" &&
      change.value === false
    ) {
      return false;
    }

    if (change.key === "syncToken") {
      return false;
    }

    return true;
  });

  return filteredChanges.length > 0;
}

const calendarCollectionConfig = drizzleCollectionOptions({
  db,
  table: calendars,
  primaryColumn: calendars.id,
  startSync: true,
  prepare: async () => {
    await client.waitReady;

    await runMigrations(client);
  },
  sync: async ({ collection, write }) => {
    const remote = await getCalendars();
    const local = new Map(
      collection.toArray.map((calendar) => [
        collection.getKeyFromItem(calendar),
        calendar,
      ]),
    );

    const seen = new Set<string>();

    for (const calendar of remote) {
      const key = `${calendar.providerAccountId}-${calendar.id}`;
      const existing = local.get(key);

      if (!existing) {
        write({ type: "insert", value: calendar });

        continue;
      }

      seen.add(key);

      if (!changed(existing, calendar)) {
        continue;
      }

      write({
        type: "update",
        value: {
          ...calendar,
          syncToken: existing.syncToken ?? null,
        },
      });
    }

    for (const [key, calendar] of local.entries()) {
      if (seen.has(key)) {
        continue;
      }

      write({ type: "delete", value: calendar });
    }
  },
  getKey: (calendar) => `${calendar.providerAccountId}-${calendar.id}`,
  // onInsert: async ({ transaction }) => {},
  // onUpdate: async ({ transaction }) => {},
  // onDelete: async ({ transaction }) => {},
});

export const calendarCollection = createCollection(calendarCollectionConfig);

async function getCalendars(): Promise<CalendarRow[]> {
  const result = await trpc.calendars.sync.query();

  return result.map((calendar) => ({
    ...calendar,
    description: calendar.description ?? null,
    etag: calendar.etag ?? null,
    timeZone: calendar.timeZone ?? null,
    color: calendar.color ?? null,
    syncToken: calendar.syncToken ?? null,
  }));
}
