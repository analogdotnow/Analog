"use client";

import * as React from "react";
import type { Temporal } from "temporal-polyfill";

import { intervalsOverlap, isAfter, isBefore } from "@repo/temporal";

import {
  placeIntoLanes,
  type PositionedLaneItem,
} from "@/components/calendar/utils/multi-day-layout";
import { useAllDayItems } from "@/hooks/calendar/use-week-items";
import type { InlineDisplayItem } from "@/lib/display-item";
import { useDefaultTimeZone } from "@/store/hooks";
import {
  useInfiniteWeekViewDays,
  type VirtualizedDay,
} from "./infinite-week-view-day-provider";
import { useInfiniteWeekView } from "./infinite-week-view-provider";

export interface PositionedAllDayItem {
  item: InlineDisplayItem;
  lane: number;
  startIndex: number;
  span: number;
}

interface InfiniteWeekViewAllDayEventContextValue {
  items: PositionedAllDayItem[];
  totalLanes: number;
}

const InfiniteWeekViewAllDayEventContext =
  React.createContext<InfiniteWeekViewAllDayEventContextValue | null>(null);

interface InfiniteWeekViewAllDayEventProviderProps {
  children: React.ReactNode;
}

export function InfiniteWeekViewAllDayEventProvider({
  children,
}: InfiniteWeekViewAllDayEventProviderProps) {
  "use memo";

  const { view } = useInfiniteWeekView();
  const { days } = useInfiniteWeekViewDays();
  const defaultTimeZone = useDefaultTimeZone();

  const allDayItems = useAllDayItems();
  const lanes = placeIntoLanes(allDayItems, defaultTimeZone);

  const items = computePositionedItems({
    lanes,
    range: {
      start: days.at(0)!,
      end: days.at(-1)!,
    },
  });

  const value = {
    items,
    totalLanes: computeTotalLanes({ items, range: view.range }),
  };

  return (
    <InfiniteWeekViewAllDayEventContext value={value}>
      {children}
    </InfiniteWeekViewAllDayEventContext>
  );
}

export function useInfiniteWeekViewAllDayEvents() {
  const context = React.use(InfiniteWeekViewAllDayEventContext);

  if (!context) {
    throw new Error(
      "useInfiniteWeekViewAllDayEvents must be used within an InfiniteWeekViewAllDayEventProvider",
    );
  }

  return context;
}

interface ComputedPositionedItemsOptions {
  lanes: PositionedLaneItem[][];
  range: {
    start: VirtualizedDay;
    end: VirtualizedDay;
  };
}

function computePositionedItems({
  lanes,
  range,
}: ComputedPositionedItemsOptions) {
  const positioned: PositionedAllDayItem[] = [];

  for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
    const lane = lanes[laneIndex];

    if (!lane) {
      continue;
    }

    for (const { item } of lane) {
      const position = computePosition({ item, range });

      if (!position) {
        continue;
      }

      positioned.push({
        item,
        lane: laneIndex,
        startIndex: position.startIndex,
        span: position.span,
      });
    }
  }

  return positioned;
}

interface ComputedTotalLanesOptions {
  items: PositionedAllDayItem[];
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

function computeTotalLanes({ items, range }: ComputedTotalLanesOptions) {
  let maxLane = 0;

  for (const { item, lane } of items) {
    if (!intervalsOverlap({ start: item.start, end: item.end }, range)) {
      continue;
    }

    maxLane = Math.max(maxLane, lane + 1);
  }

  return maxLane;
}

interface ComputedPositionOptions {
  item: InlineDisplayItem;
  range: {
    start: VirtualizedDay;
    end: VirtualizedDay;
  };
}

function computePosition({ item, range }: ComputedPositionOptions) {
  const { start, end } = clampRange({
    start: item.date.start,
    end: item.date.end,
    range: {
      start: range.start.date,
      end: range.end.date,
    },
  });

  const startIndex = range.start.index + start.since(range.start.date).days;
  const endIndex = range.start.index + end.since(range.start.date).days;

  if (endIndex < startIndex) {
    return null;
  }

  return { startIndex, span: endIndex - startIndex + 1 };
}

interface ClampRangeOptions {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

function clampRange({ start, end, range }: ClampRangeOptions) {
  return {
    start: isBefore(start, range.start) ? range.start : start,
    end: isAfter(end, range.end) ? range.end : end,
  };
}
