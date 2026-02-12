import { Temporal } from "temporal-polyfill";

import { isSameDay } from "@repo/temporal";

import { DisplayItem } from "@/lib/display-item";

export function itemsStartingOn<T extends DisplayItem>(
  items: T[],
  day: Temporal.PlainDate,
): T[] {
  return items.filter((item) => isSameDay(item.date.start, day));
}
