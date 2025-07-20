import { Temporal } from "temporal-polyfill";

import type { CalendarEvent } from "@/components/event-calendar";

export type EventCollectionItem = {
  event: CalendarEvent;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

export function convertToZonedDateTime(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  timeZone: string,
): Temporal.ZonedDateTime {
  if (value instanceof Temporal.PlainDate) {
    return value.toZonedDateTime({ timeZone });
  }
  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO(timeZone);
  }

  return value.withTimeZone(timeZone);
}

export function mapEventsToItems(
  events: CalendarEvent[],
  timeZone: string,
): EventCollectionItem[] {
  return events.map((event) => ({
    event,
    start: convertToZonedDateTime(event.start, timeZone),
    end: convertToZonedDateTime(event.end, timeZone).subtract({ seconds: 1 }),
  }));
}
