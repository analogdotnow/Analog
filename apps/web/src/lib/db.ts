import { Dexie, Table } from "dexie";
import { SuperJSONResult } from "superjson";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import { Calendar, CalendarEvent } from "./interfaces";
import { superjson } from "./trpc/superjson";

export interface EventRow extends Omit<CalendarEvent, "start" | "end"> {
  start: SuperJSONResult;
  end: SuperJSONResult;

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

export function eventQueryInput(event: CalendarEvent): EventRow {
  const startUnix = temporalToEpochMs(event.start);
  const endUnix = temporalToEpochMs(event.end);

  const start = superjson.serialize(event.start);
  const end = superjson.serialize(event.end);

  return {
    ...event,
    start,
    end,
    startUnix,
    endUnix,
  };
}

export function eventQuery(row: EventRow): CalendarEvent {
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

  return { ...rest, start, end };
}

export const db = new Database();
