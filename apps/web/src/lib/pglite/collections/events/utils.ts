import { toDate } from "@repo/temporal";

import { events } from "@/lib/drizzle/schema";
import type { CalendarEvent } from "@/lib/interfaces";

export type EventRow = typeof events.$inferSelect;

export function serializeEvent(event: CalendarEvent): EventRow {
  return {
    id: event.id,
    start: event.start,
    end: event.end,
    calendarId: event.calendarId,
    providerId: event.providerId,
    providerAccountId: event.providerAccountId ?? event.accountId,
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

export function deserializeEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    start: row.start,
    end: row.end,
    calendarId: row.calendarId,
    accountId: row.providerAccountId,
    providerAccountId: row.providerAccountId ?? undefined,
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
