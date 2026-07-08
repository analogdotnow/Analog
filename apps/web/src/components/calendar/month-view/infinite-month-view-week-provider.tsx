"use client";

// Required to ensure the scroll position is reset on fast refresh
// @refresh reset
import * as React from "react";
import { flushSync } from "react-dom";
// Polyfills the scrollend event; remove once scrollend browser support on caniuse.com reaches 90%
import "scrollyfills";
import { Temporal } from "temporal-polyfill";

import { eachDayOfInterval, endOfWeek, startOfWeek } from "@repo/temporal";

import { SCROLL_MULTIPLIER } from "@/components/calendar/constants";
import { useIsResizing } from "@/hooks/use-resize";
import { LRUCache } from "@/lib/data-structures/lru-cache";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useSetVisibleRange } from "@/store/hooks";

export interface VisualizedRows {
  count: number;
  total: number;
  fraction: number;
  center: number;
}

export interface DerivedMonthWeek {
  index: number;
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
  days: Temporal.PlainDate[];
}

type WeekStartsOn = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const VISIBLE_ROWS = 6;
const EDGE_THRESHOLD = 0.1;
const MONTH_WEEK_BUFFER_COUNT = 12;

const EPOCH = Temporal.PlainDate.from("1970-01-01");

export function epochWeekOf(
  date: Temporal.PlainDate,
  weekStartsOn: WeekStartsOn,
) {
  return Math.floor(startOfWeek(date, { weekStartsOn }).since(EPOCH).days / 7);
}

const weekCache = new LRUCache<number, DerivedMonthWeek>(256);

function weekFromEpochWeek(week: number, weekStartsOn: WeekStartsOn) {
  const key = week * 8 + weekStartsOn;
  const cached = weekCache.get(key);

  if (cached) {
    return cached;
  }

  // Day `week * 7 + 6` always falls within epoch week `week`
  const start = startOfWeek(EPOCH.add({ days: week * 7 + 6 }), {
    weekStartsOn,
  });
  const end = endOfWeek(start, { weekStartsOn });

  const entry = {
    index: week,
    start,
    end,
    days: eachDayOfInterval(start, end),
  };

  weekCache.set(key, entry);

  return entry;
}

function useVisualizedRows() {
  "use memo";

  const total = SCROLL_MULTIPLIER * VISIBLE_ROWS;
  const fraction = 100 / total;
  const center = Math.floor(total / 2);

  return {
    count: VISIBLE_ROWS,
    total,
    fraction,
    center,
  };
}

function exceededThreshold(scrollElement: HTMLElement) {
  const scrollRatio =
    scrollElement.scrollTop /
    (scrollElement.scrollHeight - scrollElement.clientHeight);

  return scrollRatio < EDGE_THRESHOLD || scrollRatio > 1 - EDGE_THRESHOLD;
}

function scrollPaddingTop(scrollElement: HTMLElement) {
  const value = Number.parseFloat(
    getComputedStyle(scrollElement).scrollPaddingTop,
  );

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

interface CreateDerivedMonthWeeksOptions {
  windowStart: number;
  capacity: number;
  weekStartsOn: WeekStartsOn;
}

function createDerivedMonthWeeks({
  windowStart,
  capacity,
  weekStartsOn,
}: CreateDerivedMonthWeeksOptions) {
  return Array.from({ length: capacity }, (_, offset) =>
    weekFromEpochWeek(windowStart + offset, weekStartsOn),
  );
}

interface InfiniteMonthViewWeekContextValue {
  weeks: readonly DerivedMonthWeek[];
  rows: VisualizedRows;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  trackBase: number;
  snapTrackBase: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const InfiniteMonthViewWeekContext =
  React.createContext<InfiniteMonthViewWeekContextValue | null>(null);
InfiniteMonthViewWeekContext.displayName = "InfiniteMonthViewWeekContext";

interface InfiniteMonthViewWeekProviderProps {
  children: React.ReactNode;
}

export function InfiniteMonthViewWeekProvider({
  children,
}: InfiniteMonthViewWeekProviderProps) {
  "use memo";

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const currentDate = useCalendarStore((s) => s.currentDate);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);
  const navigationNonce = useCalendarStore((s) => s.navigationNonce);

  const isResizing = useIsResizing(scrollRef);

  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate);
  const setVisibleRange = useSetVisibleRange();

  const rows = useVisualizedRows();

  const [initialTrackBase] = React.useState(
    () => epochWeekOf(currentDate, weekStartsOn) - rows.center,
  );
  const trackBaseRef = React.useRef(initialTrackBase);
  // Render-synced copy of trackBaseRef for SnapMonths; committed via
  // flushSync so it never trails the imperative --track-base write.
  const [snapTrackBase, setSnapTrackBase] = React.useState(initialTrackBase);
  const [windowStart, setWindowStart] = React.useState(
    () => epochWeekOf(currentDate, weekStartsOn) - MONTH_WEEK_BUFFER_COUNT,
  );
  const lastSyncedEpochWeek = React.useRef<number | null>(null);
  const isProgrammaticScroll = React.useRef(false);

  const [lastReset, setLastReset] = React.useState({
    navigationNonce,
    weekStartsOn,
    center: rows.center,
  });

  if (
    lastReset.navigationNonce !== navigationNonce ||
    lastReset.weekStartsOn !== weekStartsOn ||
    lastReset.center !== rows.center
  ) {
    setLastReset({ navigationNonce, weekStartsOn, center: rows.center });
    setWindowStart(
      epochWeekOf(currentDate, weekStartsOn) - MONTH_WEEK_BUFFER_COUNT,
    );
    setSnapTrackBase(epochWeekOf(currentDate, weekStartsOn) - rows.center);
  }

  const syncWeekWindow = React.useEffectEvent((firstVisibleEpochWeek: number) => {
    if (lastSyncedEpochWeek.current === firstVisibleEpochWeek) {
      return;
    }

    lastSyncedEpochWeek.current = firstVisibleEpochWeek;
    setWindowStart(firstVisibleEpochWeek - MONTH_WEEK_BUFFER_COUNT);

    setCurrentDate(weekFromEpochWeek(firstVisibleEpochWeek, weekStartsOn).start);
    setVisibleRange({
      start: weekFromEpochWeek(firstVisibleEpochWeek, weekStartsOn).start,
      end: weekFromEpochWeek(
        firstVisibleEpochWeek + rows.count - 1,
        weekStartsOn,
      ).end,
    });
  });

  const resetToCurrentDate = React.useEffectEvent(() => {
    const currentEpochWeek = epochWeekOf(currentDate, weekStartsOn);
    const trackBase = currentEpochWeek - rows.center;

    trackBaseRef.current = trackBase;
    lastSyncedEpochWeek.current = currentEpochWeek;
    setVisibleRange({
      start: weekFromEpochWeek(currentEpochWeek, weekStartsOn).start,
      end: weekFromEpochWeek(currentEpochWeek + rows.count - 1, weekStartsOn)
        .end,
    });

    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    scrollElement.style.setProperty("--track-base", String(trackBase));

    const rowHeight = scrollElement.scrollHeight / rows.total;

    if (rowHeight <= 0) {
      return;
    }

    const previous = scrollElement.scrollTop;

    scrollElement.scrollTop =
      (currentEpochWeek - trackBase) * rowHeight -
      scrollPaddingTop(scrollElement);

    if (scrollElement.scrollTop === previous) {
      return;
    }

    isProgrammaticScroll.current = true;
  });

  React.useLayoutEffect(() => {
    resetToCurrentDate();
  }, [navigationNonce, weekStartsOn, rows.center]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    let padding = scrollPaddingTop(scrollElement);

    const firstVisibleEpochWeek = (rowHeight: number) =>
      Math.round((scrollElement.scrollTop + padding) / rowHeight) +
      trackBaseRef.current;

    const applyRowShift = (rowHeight: number) => {
      const previous = scrollElement.scrollTop;
      const firstSlot = firstVisibleEpochWeek(rowHeight) - trackBaseRef.current;
      const shift = firstSlot - rows.center;

      if (shift === 0) {
        return;
      }

      scrollElement.scrollTop = previous - shift * rowHeight;

      const applied = Math.round(
        (previous - scrollElement.scrollTop) / rowHeight,
      );

      if (applied === 0) {
        return;
      }

      trackBaseRef.current += applied;
      scrollElement.style.setProperty(
        "--track-base",
        String(trackBaseRef.current),
      );
      flushSync(() => {
        setSnapTrackBase(trackBaseRef.current);
      });
    };

    const recenter = () => {
      const rowHeight = scrollElement.scrollHeight / rows.total;

      if (rowHeight <= 0) {
        return;
      }

      applyRowShift(rowHeight);
      syncWeekWindow(firstVisibleEpochWeek(rowHeight));
    };

    const syncFromScroll = () => {
      if (isResizing.get() || isProgrammaticScroll.current) {
        return;
      }

      const rowHeight = scrollElement.scrollHeight / rows.total;

      if (rowHeight <= 0) {
        return;
      }

      if (exceededThreshold(scrollElement)) {
        recenter();

        return;
      }

      syncWeekWindow(firstVisibleEpochWeek(rowHeight));
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
        padding = scrollPaddingTop(scrollElement);
        recenter();
      }
    });

    return () => {
      unsubscribeResize();
      controller.abort();

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [rows.total, rows.center, isResizing]);

  const capacity = rows.count + 2 * MONTH_WEEK_BUFFER_COUNT;

  const weeks = createDerivedMonthWeeks({
    windowStart,
    capacity,
    weekStartsOn,
  });

  const value = {
    weeks,
    rows,
    range: {
      start: weeks.at(0)!.start,
      end: weeks.at(-1)!.end,
    },
    trackBase: initialTrackBase,
    snapTrackBase,
    scrollRef,
  };

  return (
    <InfiniteMonthViewWeekContext value={value}>
      {children}
    </InfiniteMonthViewWeekContext>
  );
}

export function useInfiniteMonthViewWeeks() {
  const context = React.use(InfiniteMonthViewWeekContext);

  if (!context) {
    throw new Error(
      "useInfiniteMonthViewWeeks must be used within an InfiniteMonthViewWeekProvider",
    );
  }

  return context;
}
