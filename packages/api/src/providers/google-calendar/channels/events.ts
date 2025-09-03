import { and, eq } from "drizzle-orm";
import { Temporal } from "temporal-polyfill";

import { Account } from "@repo/auth/server";
import { db } from "@repo/db";
import { calendars, events } from "@repo/db/schema";
import { GoogleCalendar } from "@repo/google-calendar";
import { toDate } from "@repo/temporal";

import { CalendarEvent } from "../../../interfaces";
import { parseGoogleCalendarEvent } from "../../calendars/google-calendar/events";
import type { GoogleCalendarEvent } from "../../calendars/google-calendar/interfaces";
import { syncEvents } from "../sync";

async function upsertEvent(event: CalendarEvent) {
  const values = {
    id: event.id,
    title: event.title,
    description: event.description,
    start: toDate(event.start, { timeZone: "UTC" }),
    startTimeZone:
      event.start instanceof Temporal.ZonedDateTime
        ? event.start.timeZoneId
        : null,
    end: toDate(event.end, { timeZone: "UTC" }),
    endTimeZone:
      event.end instanceof Temporal.ZonedDateTime ? event.end.timeZoneId : null,
    allDay: event.allDay,
    location: event.location,
    status: event.status,
    url: event.url,
    etag: event.etag,
    readOnly: event.readOnly,
    calendarId: event.calendarId,
    providerId: "google" as const,
    accountId: event.accountId,
    recurringEventId: event.recurringEventId,
    conference: event.conference,
    metadata: event.metadata,
    response: event.response,
  } as const;

  await db
    .insert(events)
    .values(values)
    .onConflictDoUpdate({
      target: [events.id, events.calendarId, events.accountId],
      set: {
        ...values,
      },
    });
}

interface HandleEventsMessageOptions {
  calendarId: string;
  account: Account;
}

export async function handleEventsMessage({
  calendarId,
  account,
}: HandleEventsMessageOptions) {
  const calendar = await db.query.calendars.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, calendarId), eq(table.accountId, account.id)),
  });

  if (!calendar) {
    throw new Error(`Calendar ${calendarId} not found`);
  }

  const client = new GoogleCalendar({ accessToken: account.accessToken! });

  const { nextSyncToken } = await syncEvents({
    client,
    calendarId,
    syncToken: calendar.syncToken,
    onInvalidSyncToken: async () => {
      await db.transaction(async (tx) => {
        await tx.delete(events).where(eq(events.calendarId, calendar.id));

        await tx
          .update(calendars)
          .set({ syncToken: null })
          .where(eq(calendars.id, calendar.id));
      });
    },
    onDelete: async (eventId: string) => {
      await db
        .delete(events)
        .where(and(eq(events.id, eventId), eq(events.calendarId, calendar.id)));
    },
    onUpsert: async (event: GoogleCalendarEvent) => {
      const parsedEvent = parseGoogleCalendarEvent({
        calendarId: calendar.id,
        readOnly: calendar.readOnly,
        accountId: account.id,
        event,
      });

      await upsertEvent(parsedEvent);
    },
  });

  if (nextSyncToken) {
    await db
      .update(calendars)
      .set({ syncToken: nextSyncToken, updatedAt: new Date() })
      .where(eq(calendars.id, calendar.id));
  }
}
