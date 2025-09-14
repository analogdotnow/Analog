import * as React from "react";
import { Dexie, Table } from "dexie";
import { SuperJSONResult } from "superjson";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import { Calendar, CalendarEvent } from "./interfaces";
import { superjson } from "./trpc/superjson";
import { useLiveQuery } from "dexie-react-hooks";

export interface EventRow
  extends Omit<CalendarEvent, "start" | "end" | "createdAt" | "updatedAt"> {
  start: SuperJSONResult;
  end: SuperJSONResult;
  createdAt: SuperJSONResult | undefined;
  updatedAt: SuperJSONResult | undefined;
  startUnix: number;
  endUnix: number;
}

export class Database extends Dexie {
  public events!: Table<EventRow, string>;
  public calendars!: Table<Calendar, string>;

  constructor() {
    super("db");

    this.version(1).stores({
      calendars: [
        "id",
        "providerId",
        "name",
        "description",
        "etag",
        "timeZone",
        "primary",
        "accountId",
        "providerAccountId",
        "color",
        "readOnly",
      ].join(","),
    });

    this.version(1).stores({
      events: [
        "id",
        "start",
        "end",
        "calendarId",
        "accountId",
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
        "[accountId+startUnix]",
        "[providerId+calendarId]",
        "[providerId+accountId]",
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

  return {
    ...event,
    start,
    end,
    startUnix,
    endUnix,
    createdAt,
    updatedAt,
  };
}

export function mapEventQuery(row: EventRow): CalendarEvent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startUnix, endUnix, ...rest } = row;

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

  return { ...rest, start, end, createdAt, updatedAt };
}

export const db = new Database();

export async function getEventById(id: string) {
  const row = await db.events.where("id").equals(id).first();

  // console.log("getEventById row", JSON.stringify(row, null, 2));
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