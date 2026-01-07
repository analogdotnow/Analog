import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, isWeekend } from "@repo/temporal";

import { cellHeightAtom } from "@/atoms/cell-height";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import {
  calculateWeekViewDisplayItemPositions,
  displayItemOverlapsDay,
  filterInlineItems,
  getAllDayItemCollectionsForDays,
  getDisplayItemCollectionsForDay,
  type PositionedDisplayItem,
} from "@/components/calendar/utils/positioning";
import {
  BackgroundDisplayItem,
  DisplayItem,
  InlineDisplayItem,
  SideDisplayItem,
  isBackgroundItem,
  isInlineItem,
  isSideItem,
} from "@/lib/display-item";

function preFilterItemsByDateRange<T extends DisplayItem>(
  items: T[],
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): T[] {
  return items.filter(({ start, end }) => {
    return (
      Temporal.PlainDate.compare(start.toPlainDate(), endDate) <= 0 &&
      Temporal.PlainDate.compare(end.toPlainDate(), startDate) >= 0
    );
  });
}

function isWithinWeekdayRange(
  item: DisplayItem,
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
) {
  const itemStart = item.start.toPlainDate();
  const itemEnd = item.end.toPlainDate();
  const clampedStart = isBefore(itemStart, rangeStart) ? rangeStart : itemStart;
  const clampedEnd = isAfter(itemEnd, rangeEnd) ? rangeEnd : itemEnd;

  if (clampedStart.until(clampedEnd, { largestUnit: "days" }).days >= 2) {
    return true;
  }

  return !isWeekend(clampedStart) || !isWeekend(clampedEnd);
}

export interface DisplayItemCollectionByDay {
  dayItems: InlineDisplayItem[];
  spanningItems: InlineDisplayItem[];
  allDayItems: InlineDisplayItem[];
  allItems: InlineDisplayItem[];
  backgroundItems: BackgroundDisplayItem[];
  sideItems: SideDisplayItem[];
}

export interface MonthDisplayCollection {
  itemsByDay: Map<string, DisplayItemCollectionByDay>;
}

export interface WeekDisplayCollection {
  allDayItems: InlineDisplayItem[];
  positionedItems: PositionedDisplayItem[][];
  backgroundItems: BackgroundDisplayItem[];
  sideItems: SideDisplayItem[];
}

export function useMonthDisplayCollection(
  items: DisplayItem[],
  days: Temporal.PlainDate[],
): MonthDisplayCollection {
  return useMemo(() => {
    if (items.length === 0 || days.length === 0) {
      return { itemsByDay: new Map() };
    }

    const filtered = preFilterItemsByDateRange(
      items,
      days.at(0)!,
      days.at(-1)!,
    );
    const inlineItems = filtered.filter(isInlineItem);
    const backgroundItems = filtered.filter(isBackgroundItem);
    const sideItems = filtered.filter(isSideItem);

    const itemsByDay = new Map<string, DisplayItemCollectionByDay>();

    for (const day of days) {
      const inlineCollection = getDisplayItemCollectionsForDay(
        inlineItems,
        day,
      );
      const dayBackgroundItems = backgroundItems.filter((item) =>
        displayItemOverlapsDay(item, day),
      );
      const daySideItems = sideItems.filter((item) =>
        displayItemOverlapsDay(item, day),
      );

      itemsByDay.set(day.toString(), {
        ...inlineCollection,
        backgroundItems: dayBackgroundItems,
        sideItems: daySideItems,
      });
    }

    return { itemsByDay };
  }, [items, days]);
}

export function useWeekDisplayCollection(
  items: DisplayItem[],
  days: Temporal.PlainDate[],
): WeekDisplayCollection {
  const cellHeight = useAtomValue(cellHeightAtom);

  return useMemo(() => {
    if (days.length === 0) {
      return {
        allDayItems: [],
        positionedItems: [],
        backgroundItems: [],
        sideItems: [],
      };
    }

    if (items.length === 0) {
      return {
        allDayItems: [],
        positionedItems: days.map(() => []),
        backgroundItems: [],
        sideItems: [],
      };
    }

    const filtered = preFilterItemsByDateRange(
      items,
      days.at(0)!,
      days.at(-1)!,
    );
    const inlineItems = filterInlineItems(filtered);
    const backgroundItems = filtered.filter(isBackgroundItem);
    const sideItems = filtered.filter(isSideItem);

    if (inlineItems.length === 0) {
      return {
        allDayItems: [],
        positionedItems: days.map(() => []),
        backgroundItems,
        sideItems,
      };
    }

    const allDayItems = getAllDayItemCollectionsForDays(inlineItems, days);

    const positionedItems = calculateWeekViewDisplayItemPositions({
      items: inlineItems,
      days,
      cellHeight,
    });

    return { allDayItems, positionedItems, backgroundItems, sideItems };
  }, [items, days, cellHeight]);
}

export function useWeekRowItems(
  collection: MonthDisplayCollection,
  weekStart: Temporal.PlainDate,
  weekEnd: Temporal.PlainDate,
): InlineDisplayItem[] {
  const { showWeekends } = useAtomValue(viewPreferencesAtom);

  return useMemo(() => {
    const uniqueItems = new Map<string, InlineDisplayItem>();

    let day = weekStart;

    while (Temporal.PlainDate.compare(day, weekEnd) <= 0) {
      const dayItems = collection.itemsByDay.get(day.toString());

      if (dayItems) {
        for (const item of dayItems.allItems) {
          uniqueItems.set(item.id, item);
        }
      }

      day = day.add({ days: 1 });
    }

    if (showWeekends) {
      return [...uniqueItems.values()];
    }

    return [...uniqueItems.values()].filter((item) =>
      isWithinWeekdayRange(item, weekStart, weekEnd),
    );
  }, [collection.itemsByDay, showWeekends, weekStart, weekEnd]);
}
