"use client";

// Required to ensure the scroll position is reset on fast refresh
// @refresh reset
import * as React from "react";
// Polyfills the scrollend event; remove once scrollend browser support on caniuse.com reaches 90%
import "scrollyfills";
import { Temporal } from "temporal-polyfill";

import { startOfWeek } from "@repo/temporal";

import { SCROLL_MULTIPLIER } from "@/components/calendar/constants";
import type { PositionedDisplayItem } from "@/components/calendar/utils/positioning/inline-items";
import type { PositionedSideItem } from "@/components/calendar/utils/positioning/side-items";
import type { WeekDisplayCollection } from "@/hooks/calendar/use-event-collection";
import { useIsResizing } from "@/hooks/use-resize";
import { LRUCache } from "@/lib/data-structures/lru-cache";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDisplayedDays, useSetVisibleRange } from "@/store/hooks";
import { useInfiniteWeekView } from "./infinite-week-view-provider";
import { WeekViewLayoutContext } from "./week-view-layout-context";

export interface VisualizedColumns {
  count: number;
  total: number;
  fraction: number;
  center: number;
}

export interface DerivedWeekDay {
  date: Temporal.PlainDate;
  index: number;
  items: PositionedDisplayItem[];
  sideItems: PositionedSideItem[];
}

const EDGE_THRESHOLD = 0.1;
const DAYS_IN_WEEK = 7;
const WEEK_DAY_BUFFER_COUNT = 28;
const SM_BREAKPOINT = "(min-width: 640px)";

const EPOCH = Temporal.PlainDate.from("1970-01-01");

function epochDayOf(date: Temporal.PlainDate) {
  return date.since(EPOCH).days;
}

const dateCache = new LRUCache<number, Temporal.PlainDate>(1024);

function dateFromEpochDay(day: number) {
  const cached = dateCache.get(day);

  if (cached) {
    return cached;
  }

  const date = EPOCH.add({ days: day });

  dateCache.set(day, date);

  return date;
}

function useVisualizedColumns() {
  "use memo";

  const count = useDisplayedDays();
  const total = SCROLL_MULTIPLIER * count;
  const fraction = 100 / total;
  const center = Math.floor(total / 2);

  return {
    count,
    total,
    fraction,
    center,
  };
}

function exceededThreshold(scrollElement: HTMLElement) {
  const scrollRatio =
    scrollElement.scrollLeft /
    (scrollElement.scrollWidth - scrollElement.clientWidth);

  return scrollRatio < EDGE_THRESHOLD || scrollRatio > 1 - EDGE_THRESHOLD;
}

function scrollPaddingStart(scrollElement: HTMLElement) {
  const value = Number.parseFloat(
    getComputedStyle(scrollElement).scrollPaddingInlineStart,
  );

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

interface CreateDerivedWeekDaysOptions {
  windowStart: number;
  capacity: number;
  collection: WeekDisplayCollection;
  collectionStartEpochDay: number;
}

const derivedWeekDayCache = new WeakMap<
  WeekDisplayCollection,
  LRUCache<number, DerivedWeekDay>
>();

function createDerivedWeekDays({
  windowStart,
  capacity,
  collection,
  collectionStartEpochDay,
}: CreateDerivedWeekDaysOptions) {
  if (!derivedWeekDayCache.has(collection)) {
    derivedWeekDayCache.set(collection, new LRUCache(256));
  }

  const entries = derivedWeekDayCache.get(collection)!;

  return Array.from({ length: capacity }, (_, offset) => {
    const epochDay = windowStart + offset;
    const cached = entries.get(epochDay);

    if (cached) {
      return cached;
    }

    const daysIndex = epochDay - collectionStartEpochDay;

    const day = {
      date: dateFromEpochDay(epochDay),
      index: epochDay,
      items: collection.positionedItems[daysIndex] ?? [],
      sideItems: collection.positionedSideItems[daysIndex] ?? [],
    };

    entries.set(epochDay, day);

    return day;
  });
}

interface InfiniteWeekViewDayContextValue {
  days: readonly DerivedWeekDay[];
  columns: VisualizedColumns;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  trackBase: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const InfiniteWeekViewDayContext =
  React.createContext<InfiniteWeekViewDayContextValue | null>(null);
InfiniteWeekViewDayContext.displayName = "InfiniteWeekViewDayContext";

interface InfiniteWeekViewDayProviderProps {
  children: React.ReactNode;
}

export function InfiniteWeekViewDayProvider({
  children,
}: InfiniteWeekViewDayProviderProps) {
  "use memo";

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const { collection } = useInfiniteWeekView();
  const currentDate = useCalendarStore((s) => s.currentDate);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);
  const navigationNonce = useCalendarStore((s) => s.navigationNonce);

  const isResizing = useIsResizing(scrollRef);

  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate);
  const setVisibleRange = useSetVisibleRange();

  const columns = useVisualizedColumns();

  const [initialTrackBase] = React.useState(
    () =>
      epochDayOf(startOfWeek(currentDate, { weekStartsOn })) - columns.center,
  );
  const trackBaseRef = React.useRef(initialTrackBase);
  const [windowStart, setWindowStart] = React.useState(
    () => epochDayOf(currentDate) - WEEK_DAY_BUFFER_COUNT,
  );
  const lastSyncedEpochDay = React.useRef<number | null>(null);
  const isProgrammaticScroll = React.useRef(false);

  const [lastReset, setLastReset] = React.useState({
    navigationNonce,
    weekStartsOn,
    center: columns.center,
  });

  if (
    lastReset.navigationNonce !== navigationNonce ||
    lastReset.weekStartsOn !== weekStartsOn ||
    lastReset.center !== columns.center
  ) {
    setLastReset({ navigationNonce, weekStartsOn, center: columns.center });
    setWindowStart(epochDayOf(currentDate) - WEEK_DAY_BUFFER_COUNT);
  }

  const syncDayWindow = React.useEffectEvent((firstVisibleEpochDay: number) => {
    if (lastSyncedEpochDay.current === firstVisibleEpochDay) {
      return;
    }

    lastSyncedEpochDay.current = firstVisibleEpochDay;
    setWindowStart(firstVisibleEpochDay - WEEK_DAY_BUFFER_COUNT);

    const start = dateFromEpochDay(firstVisibleEpochDay);

    setCurrentDate(start);
    setVisibleRange({
      start,
      end: start.add({ days: columns.count - 1 }),
    });
  });

  const resetToCurrentDate = React.useEffectEvent(() => {
    const currentEpochDay = epochDayOf(currentDate);
    const trackBase =
      epochDayOf(startOfWeek(currentDate, { weekStartsOn })) - columns.center;

    trackBaseRef.current = trackBase;
    lastSyncedEpochDay.current = currentEpochDay;
    setVisibleRange({
      start: currentDate,
      end: currentDate.add({ days: columns.count - 1 }),
    });

    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    scrollElement.style.setProperty("--track-base", String(trackBase));

    const columnWidth = scrollElement.scrollWidth / columns.total;

    if (columnWidth <= 0) {
      return;
    }

    const previous = scrollElement.scrollLeft;

    scrollElement.scrollLeft =
      (currentEpochDay - trackBase) * columnWidth -
      scrollPaddingStart(scrollElement);

    if (scrollElement.scrollLeft === previous) {
      return;
    }

    isProgrammaticScroll.current = true;
  });

  React.useLayoutEffect(() => {
    resetToCurrentDate();
  }, [navigationNonce, weekStartsOn, columns.center]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    let padding = scrollPaddingStart(scrollElement);

    const firstVisibleEpochDay = (columnWidth: number) =>
      Math.round((scrollElement.scrollLeft + padding) / columnWidth) +
      trackBaseRef.current;

    const applyWeekShift = (columnWidth: number) => {
      const previous = scrollElement.scrollLeft;
      const firstSlot =
        firstVisibleEpochDay(columnWidth) - trackBaseRef.current;
      const shift =
        Math.round((firstSlot - columns.center) / DAYS_IN_WEEK) * DAYS_IN_WEEK;

      if (shift === 0) {
        return;
      }

      scrollElement.scrollLeft = previous - shift * columnWidth;

      const applied =
        Math.round(
          (previous - scrollElement.scrollLeft) / (columnWidth * DAYS_IN_WEEK),
        ) * DAYS_IN_WEEK;

      if (applied === 0) {
        return;
      }

      trackBaseRef.current += applied;
      scrollElement.style.setProperty(
        "--track-base",
        String(trackBaseRef.current),
      );
    };

    const recenter = () => {
      const columnWidth = scrollElement.scrollWidth / columns.total;

      if (columnWidth <= 0) {
        return;
      }

      applyWeekShift(columnWidth);
      syncDayWindow(firstVisibleEpochDay(columnWidth));
    };

    const syncFromScroll = () => {
      if (isResizing.get() || isProgrammaticScroll.current) {
        return;
      }

      const columnWidth = scrollElement.scrollWidth / columns.total;

      if (columnWidth <= 0) {
        return;
      }

      if (exceededThreshold(scrollElement)) {
        recenter();

        return;
      }

      syncDayWindow(firstVisibleEpochDay(columnWidth));
    };

    let frame: number | null = null;

    const queueSync = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;

        syncFromScroll();
      });
    };

    const onScrollEnd = () => {
      isProgrammaticScroll.current = false;

      if (isResizing.get()) {
        return;
      }

      recenter();
    };

    const controller = new AbortController();

    scrollElement.addEventListener("scroll", queueSync, {
      passive: true,
      signal: controller.signal,
    });

    scrollElement.addEventListener("scrollend", onScrollEnd, {
      signal: controller.signal,
    });

    const onUserInput = () => {
      isProgrammaticScroll.current = false;
    };

    scrollElement.addEventListener("wheel", onUserInput, {
      passive: true,
      signal: controller.signal,
    });

    scrollElement.addEventListener("touchstart", onUserInput, {
      passive: true,
      signal: controller.signal,
    });

    const unsubscribeResize = isResizing.on("change", (resizing) => {
      if (!resizing) {
        padding = scrollPaddingStart(scrollElement);
        recenter();
      }
    });

    const breakpoint = window.matchMedia(SM_BREAKPOINT);

    breakpoint.addEventListener(
      "change",
      () => {
        padding = scrollPaddingStart(scrollElement);
        recenter();
      },
      {
        signal: controller.signal,
      },
    );

    return () => {
      unsubscribeResize();
      controller.abort();

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [columns.total, columns.center, isResizing]);

  const capacity = columns.count + 2 * WEEK_DAY_BUFFER_COUNT;

  const days = createDerivedWeekDays({
    windowStart,
    capacity,
    collection: collection.items,
    collectionStartEpochDay: epochDayOf(collection.range.start),
  });

  const value = {
    days,
    columns,
    range: {
      start: days.at(0)!.date,
      end: days.at(-1)!.date,
    },
    trackBase: initialTrackBase,
    scrollRef,
  };

  const dateFromPoint = (clientX: number, grabOffsetX?: number) => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return null;
    }

    const columnWidth = scrollElement.scrollWidth / columns.total;

    if (columnWidth <= 0) {
      return null;
    }

    const x = clientX - scrollElement.getBoundingClientRect().left;

    if (x < scrollPaddingStart(scrollElement)) {
      return null;
    }

    const slot = Math.floor((scrollElement.scrollLeft + x) / columnWidth);
    const grabDays = Math.floor((grabOffsetX ?? 0) / columnWidth);

    return dateFromEpochDay(trackBaseRef.current + slot - grabDays);
  };

  return (
    <WeekViewLayoutContext value={{ scrollRef, dateFromPoint }}>
      <InfiniteWeekViewDayContext value={value}>
        {children}
      </InfiniteWeekViewDayContext>
    </WeekViewLayoutContext>
  );
}

export function useInfiniteWeekViewDays() {
  const context = React.use(InfiniteWeekViewDayContext);

  if (!context) {
    throw new Error(
      "useInfiniteWeekViewDays must be used within an InfiniteWeekViewDayProvider",
    );
  }

  return context;
}
