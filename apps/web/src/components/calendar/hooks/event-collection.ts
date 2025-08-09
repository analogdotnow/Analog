import { Temporal } from "temporal-polyfill";

import { toZonedDateTime } from "@repo/temporal";

import type { CalendarEvent } from "@/components/calendar/interfaces";

export type EventCollectionItem = {
  event: CalendarEvent;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

export function mapEventsToItems(
  events: CalendarEvent[],
  timeZone: string,
): EventCollectionItem[] {
  return events.map((event) => ({
    event,
    start: toZonedDateTime(event.start, { timeZone }),
    end: toZonedDateTime(event.end, { timeZone }).subtract({ seconds: 1 }),
  }));
}

export function convertEventToItem(
  event: CalendarEvent,
  timeZone: string,
): EventCollectionItem {
  return {
    event,
    start: toZonedDateTime(event.start, { timeZone }),
    end: toZonedDateTime(event.end, { timeZone }).subtract({ seconds: 1 }),
  };
}
