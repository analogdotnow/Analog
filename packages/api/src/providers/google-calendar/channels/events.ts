import { eq } from "drizzle-orm";
import { Temporal } from "temporal-polyfill";

import { Account } from "@repo/auth/server";
import { db } from "@repo/db";
import { calendars, events } from "@repo/db/schema";
import { GoogleCalendar } from "@repo/google-calendar";

import { parseGoogleCalendarEvent } from "../utils";
import { Channel, ChannelHeaders } from "./headers";
import { CalendarEvent } from "../../interfaces";
import { revalidateTag } from "next/cache";

function temporalToDate(
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
): Date {
  if (value instanceof Temporal.Instant) {
    return new Date(value.epochMilliseconds);
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return new Date(value.toInstant().epochMilliseconds);
  }

  return new Date(value.toString());
}

async function updateEvent(event: CalendarEvent) {
  const values = {
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    start: temporalToDate(event.start),
    startTimeZone:
    event.start instanceof Temporal.ZonedDateTime
        ? event.start.timeZoneId
        : null,
    end: temporalToDate(event.end),
    endTimeZone:
     event.end instanceof Temporal.ZonedDateTime
        ? event.end.timeZoneId
        : null,
    allDay: event.allDay,
    location: event.location ?? null,
    status: event.status ?? null,
    url: event.url ?? null,
    calendarId: event.calendarId,
    providerId: "google" as const,
    accountId: event.accountId,
  } as const;

  await db
    .insert(events)
    .values(values)
    .onConflictDoUpdate({
      target: [events.id],
      set: {
        ...values,
      },
    });
}

async function deleteEvent(event: CalendarEvent) {
  await db.delete(events).where(eq(events.id, event.id!));
}


interface HandleEventsMessageOptions {
  channel: Channel;
  headers: ChannelHeaders;
  account: Account & { accessToken: string };
}

export async function handleEventsMessage({
  channel,
  headers,
  account,
}: HandleEventsMessageOptions) {
  const calendar = await db.query.calendars.findFirst({
    where: (table, { eq }) => eq(table.id, channel.resourceId),
  });

  if (!calendar) {
    throw new Error(`Calendar ${channel.resourceId} not found`);
  }

  revalidateTag(`calendar.events.${calendar.accountId}.${calendar.id}`);

  // const client = new GoogleCalendar({ accessToken: account.accessToken });

  // const response = await client.calendars.events.list(calendar.calendarId, {
  //   singleEvents: true,
  //   showDeleted: true,
  //   maxResults: 2500,
  //   syncToken: calendar.syncToken ?? undefined,
  // });

  // if (response.nextSyncToken) {
  //   await db
  //     .update(calendars)
  //     .set({ syncToken: response.nextSyncToken, updatedAt: new Date() })
  //     .where(eq(calendars.id, calendar.id));
  // }

  // const items = response.items ?? [];

  // if (items.length === 0) {
  //   return;
  // }

  // for (const event of items) {
  //   if (event.status === "cancelled") {
  //     await db.delete(events).where(eq(events.id, event.id!));
  //     continue;
  //   }

  //   const parsedEvent = parseGoogleCalendarEvent({
  //     calendar,
  //     accountId: account.id,
  //     event,
  //   });

  //   await updateEvent(parsedEvent);
  // }
}
