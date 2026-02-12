import { Temporal } from "temporal-polyfill";

import {
  JourneyDisplayItem,
  SideDisplayItem,
  isSideItem,
} from "@/lib/display-item";
import { displayItemOverlapsDay } from "./inline-items";
import { clampToEndOfDay, clampToStartOfDay } from "./utils";

export interface PositionedSideItem {
  item: JourneyDisplayItem;
  position: {
    top: number;
    height: number;
  };
}

function calculateSideItemDimensions(
  start: Temporal.ZonedDateTime,
  end: Temporal.ZonedDateTime,
  cellHeight: number,
): { top: number; height: number } {
  const startHourValue = start.hour + start.minute / 60;
  const endHourValue = end.hour + end.minute / 60;

  return {
    top: startHourValue * cellHeight,
    height: (endHourValue - startHourValue) * cellHeight,
  };
}

function getSideItemsForDay(
  items: SideDisplayItem[],
  day: Temporal.PlainDate,
): JourneyDisplayItem[] {
  return items.filter(
    (item): item is JourneyDisplayItem =>
      isSideItem(item) && displayItemOverlapsDay(item, day),
  );
}

function positionSideItemsForDay(
  items: SideDisplayItem[],
  day: Temporal.PlainDate,
  cellHeight: number,
): PositionedSideItem[] {
  const sideItems = getSideItemsForDay(items, day);

  return sideItems.map((item) => {
    const start = clampToStartOfDay(item.start, day);
    const end = clampToEndOfDay(item.end, day);

    const position = calculateSideItemDimensions(start, end, cellHeight);

    return { item, position };
  });
}

interface CalculateWeekViewSideItemPositionsOptions {
  items: SideDisplayItem[];
  days: Temporal.PlainDate[];
  cellHeight: number;
}

export function calculateWeekViewSideItemPositions({
  items,
  days,
  cellHeight,
}: CalculateWeekViewSideItemPositionsOptions): PositionedSideItem[][] {
  return days.map((day) => positionSideItemsForDay(items, day, cellHeight));
}
