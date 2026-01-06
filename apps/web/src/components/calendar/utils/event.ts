import { Temporal } from "temporal-polyfill";

import { isAfter, isSameDay } from "@repo/temporal";

import { EventCollectionItem } from "../hooks/event-collection";

export function filterPastEvents(
  events: EventCollectionItem[],
  timeZone: string,
) {
  const now = Temporal.Now.zonedDateTimeISO(timeZone);

  return events.filter((event) => isAfter(event.end, now));
}

export function eventsStartingOn(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
) {
  return events.filter((event) => isSameDay(event.start.toPlainDate(), day));
}
