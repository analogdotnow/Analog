import { Temporal } from "temporal-polyfill";

import { toZonedDateTime } from "@repo/temporal";

import type { CalendarEvent } from "@/lib/interfaces";

export type EventCollectionItem = {
  event: CalendarEvent;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

function createEventCollectionItem(
  event: CalendarEvent,
  timeZone: string,
): EventCollectionItem {
  const start = toZonedDateTime(event.start, { timeZone });
  let endExclusive = toZonedDateTime(event.end, { timeZone });

  if (event.allDay) {
    const startDate = start.toPlainDate();
    const endDate = endExclusive.toPlainDate();

    if (Temporal.PlainDate.compare(startDate, endDate) === 0) {
      endExclusive = start.add({ days: 1 });
    }
  }

  const end =
    Temporal.ZonedDateTime.compare(endExclusive, start) > 0
      ? endExclusive.subtract({ seconds: 1 })
      : start;

  return {
    event,
    start,
    end,
  };
}

export function mapEventsToItems(
  events: CalendarEvent[],
  timeZone: string,
): EventCollectionItem[] {
  return events.map((event) => createEventCollectionItem(event, timeZone));
}

export function convertEventToItem(
  event: CalendarEvent,
  timeZone: string,
): EventCollectionItem {
  return createEventCollectionItem(event, timeZone);
}
