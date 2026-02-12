import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, isWeekend } from "@repo/temporal";

import { placeIntoLanes } from "@/components/calendar/utils/multi-day-layout";
import {
  calculateWeekViewDisplayItemPositions,
  displayItemOverlapsDay,
  getAllDayItemCollectionsForDays,
  getDisplayItemCollectionsForDay,
  type PositionedDisplayItem,
} from "@/components/calendar/utils/positioning/inline-items";
import {
  calculateWeekViewSideItemPositions,
  type PositionedSideItem,
} from "@/components/calendar/utils/positioning/side-items";
import {
  BackgroundDisplayItem,
  DisplayItem,
  InlineDisplayItem,
  SideDisplayItem,
  isBackgroundItem,
  isInlineItem,
  isSideItem,
} from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

export function filterItemsByRange<T extends DisplayItem>(
  items: T[],
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): T[] {
  return items.filter(
    ({ date }) =>
      Temporal.PlainDate.compare(date.start, endDate) <= 0 &&
      Temporal.PlainDate.compare(date.end, startDate) >= 0,
  );
}

function isWithinWeekdayRange(
  item: DisplayItem,
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
) {
  const itemStart = item.date.start;
  const itemEnd = item.date.end;
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
  positionedSideItems: PositionedSideItem[][];
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

    const filtered = filterItemsByRange(items, days.at(0)!, days.at(-1)!);
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
  preFilter: boolean = true,
): WeekDisplayCollection {
  "use memo";

  const cellHeight = useCalendarStore((s) => s.cellHeight);

  return useMemo(() => {
    if (days.length === 0) {
      return {
        allDayItems: [],
        positionedItems: [],
        positionedSideItems: [],
        backgroundItems: [],
        sideItems: [],
      };
    }

    if (items.length === 0) {
      return {
        allDayItems: [],
        positionedItems: days.map(() => []),
        positionedSideItems: days.map(() => []),
        backgroundItems: [],
        sideItems: [],
      };
    }

    const filtered = preFilter
      ? filterItemsByRange(items, days.at(0)!, days.at(-1)!)
      : items;
    const inlineItems = filtered.filter(isInlineItem);
    const backgroundItems = filtered.filter(isBackgroundItem);
    const sideItems = filtered.filter(isSideItem);

    const positionedSideItems = calculateWeekViewSideItemPositions({
      items: sideItems,
      days,
      cellHeight,
    });

    if (inlineItems.length === 0) {
      return {
        allDayItems: [],
        positionedItems: days.map(() => []),
        positionedSideItems,
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

    return {
      allDayItems,
      positionedItems,
      positionedSideItems,
      backgroundItems,
      sideItems,
    };
  }, [items, days, cellHeight, preFilter]);
}

export function useWeekRowItems(
  collection: MonthDisplayCollection,
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  },
) {
  const defaultTimeZone = useDefaultTimeZone();
  const showWeekends = useCalendarStore((s) => s.viewPreferences.showWeekends);

  const items = useMemo(() => {
    const uniqueItems = new Map<string, InlineDisplayItem>();

    let day = range.start;

    while (Temporal.PlainDate.compare(day, range.end) <= 0) {
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
      isWithinWeekdayRange(item, range.start, range.end),
    );
  }, [collection.itemsByDay, showWeekends, range.start, range.end]);

  return useMemo(() => {
    return placeIntoLanes(items, defaultTimeZone).map((lane) =>
      lane.map((p) => p.item),
    );
  }, [items, defaultTimeZone]);
}
