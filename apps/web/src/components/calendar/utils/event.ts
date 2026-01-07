import { Temporal } from "temporal-polyfill";

import { isAfter, isSameDay } from "@repo/temporal";

import { DisplayItem, InlineDisplayItem } from "@/lib/display-item";

export function filterPastItems<T extends DisplayItem>(
  items: T[],
  timeZone: string,
): T[] {
  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  return items.filter((item) => isAfter(item.end, now));
}

export function itemsStartingOn<T extends DisplayItem>(
  items: T[],
  day: Temporal.PlainDate,
): T[] {
  return items.filter((item) => isSameDay(item.start.toPlainDate(), day));
}
