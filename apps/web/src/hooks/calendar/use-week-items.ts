import * as React from "react";
import { Temporal } from "temporal-polyfill";

import {
  calculateWeekViewDisplayItemPositions,
  getAllDayItemCollectionsForDays,
} from "@/components/calendar/utils/positioning/inline-items";
import { calculateWeekViewSideItemPositions } from "@/components/calendar/utils/positioning/side-items";
import { useInfiniteWeekView } from "@/components/calendar/week-view/infinite-week-view-provider";
import {
  DisplayItem,
  isBackgroundItem,
  isInlineItem,
  isSideItem,
} from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";

export function useAllDayItems() {
  "use memo";

  const { items, collection } = useInfiniteWeekView();

  return React.useMemo(() => {
    if (collection.range.days.length === 0 || items.length === 0) {
      return [];
    }

    return getAllDayItemCollectionsForDays(
      items.filter(isInlineItem),
      collection.range.days,
    );
  }, [items, collection.range.days]);
}

export function useInlineItems(
  items: DisplayItem[],
  days: Temporal.PlainDate[],
) {
  "use memo";

  const cellHeight = useCalendarStore((s) => s.cellHeight);

  return React.useMemo(() => {
    if (days.length === 0 || items.length === 0) {
      return days.map(() => []);
    }

    return calculateWeekViewDisplayItemPositions({
      items: items.filter(isInlineItem),
      days,
      cellHeight,
    });
  }, [items, days, cellHeight]);
}

export function useBackgroundItems(
  items: DisplayItem[],
  days: Temporal.PlainDate[],
) {
  "use memo";

  return React.useMemo(() => {
    if (days.length === 0 || items.length === 0) {
      return [];
    }

    return items.filter(isBackgroundItem);
  }, [items, days]);
}

export function useSideItems(items: DisplayItem[], days: Temporal.PlainDate[]) {
  "use memo";

  const cellHeight = useCalendarStore((s) => s.cellHeight);

  return React.useMemo(() => {
    if (days.length === 0 || items.length === 0) {
      return days.map(() => []);
    }

    // TODO: insert journey items here, insert into sorted

    return calculateWeekViewSideItemPositions({
      items: items.filter(isSideItem),
      days,
      cellHeight,
    });
  }, [items, days, cellHeight]);
}
