import * as React from "react";
import { Dexie, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { SuperJSONResult } from "superjson";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { Calendar, CalendarEvent } from "./interfaces";
import { superjson } from "./trpc/superjson";

export interface EventRow extends Omit<
  CalendarEvent,
  "start" | "end" | "createdAt" | "updatedAt" | "calendar"
> {
  calendarId: string;
  providerId: "google" | "microsoft";
  providerAccountId: string;
  start: SuperJSONResult;
  end: SuperJSONResult;
  createdAt: SuperJSONResult | undefined;
  updatedAt: SuperJSONResult | undefined;
  startUnix: number;
  endUnix: number;
}

export interface CalendarRow extends Omit<Calendar, "provider"> {
  providerId: "google" | "microsoft";
  providerAccountId: string;
}

export class Database extends Dexie {
  public events!: Table<EventRow, string>;
  public calendars!: Table<CalendarRow, string>;

  constructor() {
    super("db");

    this.version(2).stores({
      calendars: [
        "id",
        "providerId",
        "name",
        "description",
        "etag",
        "timeZone",
        "primary",
        "providerAccountId",
        "color",
        "readOnly",
      ].join(","),
      events: [
        "id",
        "start",
        "end",
        "calendarId",
        "providerId",
        "providerAccountId",
        "recurringEventId",
        "readOnly",
        "visibility",
        "availability",
        "status",
        "etag",
        "title",
        "location",
        "url",
        "color",
        "createdAt",
        "updatedAt",
        "startUnix",
        "endUnix",

        "response.status",

        "[calendarId+startUnix]",
        "[providerAccountId+startUnix]",
        "[providerId+calendarId]",
        "[providerId+providerAccountId]",
        "[startUnix+endUnix]",
      ].join(","),
    });
  }
}

export function temporalToEpochMs(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
): number {
  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO("UTC").epochMilliseconds;
  } else if (value instanceof Temporal.ZonedDateTime) {
    return value.withTimeZone("UTC").epochMilliseconds;
  }

  return startOfDay(value, { timeZone: "UTC" }).epochMilliseconds;
}

export function mapEventQueryInput(event: CalendarEvent): EventRow {
  const startUnix = temporalToEpochMs(event.start);
  const endUnix = temporalToEpochMs(event.end);

  const start = superjson.serialize(event.start);
  const end = superjson.serialize(event.end);

  const createdAt = event.createdAt
    ? superjson.serialize(event.createdAt)
    : undefined;
  const updatedAt = event.updatedAt
    ? superjson.serialize(event.updatedAt)
    : undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { calendar, ...rest } = event;

  return {
    ...rest,
    calendarId: event.calendar.id,
    providerId: event.calendar.provider.id,
    providerAccountId: event.calendar.provider.accountId,
    start,
    end,
    startUnix,
    endUnix,
    createdAt,
    updatedAt,
  };
}

export function mapEventQuery(row: EventRow): CalendarEvent {
  const {
    startUnix: _startUnix,
    endUnix: _endUnix,
    calendarId,
    providerId,
    providerAccountId,
    ...rest
  } = row;

  const start = superjson.deserialize(row.start) as
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant;
  const end = superjson.deserialize(row.end) as
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant;
  const createdAt = row.createdAt
    ? (superjson.deserialize(row.createdAt) as Temporal.Instant)
    : undefined;
  const updatedAt = row.updatedAt
    ? (superjson.deserialize(row.updatedAt) as Temporal.Instant)
    : undefined;

  return {
    ...rest,
    calendar: {
      id: calendarId,
      provider: {
        id: providerId,
        accountId: providerAccountId,
      },
    },
    start,
    end,
    createdAt,
    updatedAt,
  } as CalendarEvent;
}

export function mapCalendarQueryInput(calendar: Calendar): CalendarRow {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { provider, ...rest } = calendar;
  return {
    ...rest,
    providerId: provider.id,
    providerAccountId: provider.accountId,
  };
}

export function mapCalendarQuery(row: CalendarRow): Calendar {
  const { providerId, providerAccountId, ...rest } = row;
  return {
    ...rest,
    provider: {
      id: providerId,
      accountId: providerAccountId,
    },
  };
}

export const db = new Database();

export async function getEventById(id: string) {
  const row = await db.events.where("id").equals(id).first();

  if (!row) {
    return undefined;
  }

  return mapEventQuery(row);
}

export function useLiveEventById(id: string) {
  const result = useLiveQuery(
    () => db.events.where("id").equals(id).first(),
    [id],
  );

  return React.useMemo(() => {
    return result ? mapEventQuery(result) : undefined;
  }, [result]);
}

export function useOngoingEvent(): CalendarEvent[] {
  const now = useZonedDateTime();

  const nowEpoch = React.useMemo(() => {
    return now.toInstant().epochMilliseconds;
  }, [now]);

  const result = useLiveQuery(async () => {
    const rows = await db.events
      .where("startUnix")
      .belowOrEqual(nowEpoch)
      .and((row) => row.endUnix >= nowEpoch)
      .sortBy("startUnix");

    return rows.map(mapEventQuery);
  }, [nowEpoch]);

  return result ?? [];
}

export function useUpcomingEvent(): CalendarEvent[] {
  const now = useZonedDateTime();

  const nowEpoch = React.useMemo(() => {
    return now.toInstant().epochMilliseconds;
  }, [now]);

  const result = useLiveQuery(async () => {
    const candidates = await db.events
      .where("startUnix")
      .above(nowEpoch)
      .limit(10)
      .toArray();

    const firstStart = candidates[0]?.startUnix;
    const rows =
      firstStart !== undefined
        ? candidates.filter((row) => row.startUnix === firstStart)
        : [];

    return rows.map(mapEventQuery);
  }, [nowEpoch]);

  return result ?? [];
}
