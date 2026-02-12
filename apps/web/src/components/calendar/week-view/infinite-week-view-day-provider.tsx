"use client";

// Required to ensure the scroll position is reset on fast refresh
// @refresh reset
import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isSameDay, startOfWeek } from "@repo/temporal";

import { useIsResizing } from "@/hooks/use-resize";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDisplayedDays, useSetVisibleRange } from "@/store/hooks";
import {
  derivedWeekDayBufferReducer,
  type DerivedWeekDayBufferState,
} from "./derived-week-day-buffer-reducer";
import {
  BUFFER_DAYS,
  useInfiniteWeekView,
} from "./infinite-week-view-provider";
import {
  DEFAULT_WEEK_DAY_BUFFER_COUNT,
  deriveWeekDayBufferResult,
  deriveWeekDayBufferSnapshot,
  type DerivedWeekDay,
  type DerivedWeekDayBufferInput,
} from "./use-derived-week-day-buffer";

export type VirtualizedDay = DerivedWeekDay;

export interface VisualizedColumns {
  count: number;
  total: number;
  fraction: number;
  center: number;
}

const SCROLL_MULTIPLIER = 50;
export const BUFFER_COUNT = DEFAULT_WEEK_DAY_BUFFER_COUNT;
const EDGE_THRESHOLD = 0.1;
const MAX_SAFE_DRIFT = BUFFER_DAYS - BUFFER_COUNT;

export function useVisualizedColumns(): VisualizedColumns {
  "use memo";

  const count = useDisplayedDays();
  const total = SCROLL_MULTIPLIER * count;
  const fraction = 2 / count;
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

function centerScrollPosition(scrollElement: HTMLElement) {
  const scrollPaddingStart = Number.parseFloat(
    getComputedStyle(scrollElement).scrollPaddingInlineStart,
  );

  scrollElement.scrollTo({
    left: Math.max(0, scrollElement.scrollWidth / 2 - scrollPaddingStart),
    behavior: "instant",
  });
}

interface InfiniteWeekViewDayContextValue {
  days: VirtualizedDay[];
  columns: VisualizedColumns;
  anchor: Temporal.PlainDate;
  window: {
    start: number;
    end: number;
  };
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const InfiniteWeekViewDayContext =
  React.createContext<InfiniteWeekViewDayContextValue | null>(null);

interface InfiniteWeekViewDayProviderProps {
  children: React.ReactNode;
}

function createBufferState(
  input: DerivedWeekDayBufferInput,
): DerivedWeekDayBufferState {
  const snapshot = deriveWeekDayBufferSnapshot(null, input);

  return {
    snapshot,
    result: deriveWeekDayBufferResult(snapshot, input),
  };
}

export function InfiniteWeekViewDayProvider({
  children,
}: InfiniteWeekViewDayProviderProps) {
  "use memo";

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const { collection } = useInfiniteWeekView();
  const currentDate = useCalendarStore((s) => s.currentDate);
  const anchor = useCalendarStore((s) => s.anchor);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const isResizing = useIsResizing(scrollRef);

  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate);
  const setExternalAnchor = useCalendarStore((s) => s.setAnchor);
  const setVisibleRange = useSetVisibleRange();

  const columns = useVisualizedColumns();

  const scrollAnchorRef = React.useRef(
    startOfWeek(currentDate, { weekStartsOn }),
  );
  const [baseIndex, setBaseIndex] = React.useState(
    () => columns.center - BUFFER_COUNT,
  );
  const latestScroll = React.useRef<Temporal.PlainDate>(null);

  const [bufferState, dispatchBuffer] = React.useReducer(
    derivedWeekDayBufferReducer,
    {
      anchor,
      columns,
      collection: collection.items,
      collectionStart: collection.range.start,
      baseIndex,
      bufferCount: BUFFER_COUNT,
    },
    createBufferState,
  );

  React.useLayoutEffect(() => {
    if (latestScroll.current && isSameDay(latestScroll.current, currentDate)) {
      latestScroll.current = null;

      return;
    }

    latestScroll.current = null;
    setBaseIndex(columns.center - BUFFER_COUNT);
    setExternalAnchor(currentDate);

    if (!isSameDay(scrollAnchorRef.current, currentDate)) {
      scrollAnchorRef.current = currentDate;
    }
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    centerScrollPosition(scrollElement);
  }, [currentDate, weekStartsOn, columns.center, setExternalAnchor]);

  React.useLayoutEffect(() => {
    dispatchBuffer({
      type: "derive",
      input: {
        anchor,
        columns,
        collection: collection.items,
        collectionStart: collection.range.start,
        baseIndex,
        bufferCount: BUFFER_COUNT,
      },
    });
  }, [anchor, columns, collection.items, collection.range.start, baseIndex]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const setCurrentDayWindow = (start: Temporal.PlainDate) => {
      latestScroll.current = start;

      setCurrentDate(start);
      setVisibleRange({
        start,
        end: start.add({ days: columns.count - 1 }),
      });
    };

    const centeredBaseIndex = columns.center - BUFFER_COUNT;

    const getCurrentOffset = () => {
      const columnWidth = scrollElement.scrollWidth / columns.total;
      const scrollPaddingStart = Number.parseFloat(
        getComputedStyle(scrollElement).scrollPaddingInlineStart,
      );

      return Math.round(
        (scrollElement.scrollLeft + scrollPaddingStart) / columnWidth,
      );
    };

    const syncFromScroll = ({
      force = false,
      recenter = false,
    }: {
      force?: boolean;
      recenter?: boolean;
    } = {}) => {
      if (!force && isResizing.get()) {
        return;
      }

      const nextOffset = getCurrentOffset();
      const scrollAnchorAtSync = scrollAnchorRef.current;
      const drift = Math.abs(nextOffset - columns.center);
      const shouldCenter =
        recenter || drift >= MAX_SAFE_DRIFT || exceededThreshold(scrollElement);
      const start = scrollAnchorAtSync.add({
        days: nextOffset - columns.center,
      });

      if (shouldCenter) {
        if (!isSameDay(start, scrollAnchorAtSync)) {
          scrollAnchorRef.current = start;
          setExternalAnchor(start);
        }

        centerScrollPosition(scrollElement);
        setBaseIndex(centeredBaseIndex);
        setCurrentDayWindow(start);

        return;
      }

      if (
        !force &&
        latestScroll.current &&
        isSameDay(start, latestScroll.current)
      ) {
        return;
      }

      setBaseIndex(nextOffset - BUFFER_COUNT);
      setCurrentDayWindow(start);
    };

    syncFromScroll({ force: true });

    let frame: number | null = null;
    let forceSyncOnFrame = false;

    const queueSync = (force = false) => {
      forceSyncOnFrame = forceSyncOnFrame || force;

      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;

        const shouldForceSync = forceSyncOnFrame;
        forceSyncOnFrame = false;

        syncFromScroll({ force: shouldForceSync });
      });
    };

    const onScroll = () => {
      queueSync();
    };

    const controller = new AbortController();

    scrollElement.addEventListener("scroll", onScroll, {
      passive: true,
      signal: controller.signal,
    });

    scrollElement.addEventListener(
      "scrollend",
      () => {
        syncFromScroll({ force: true, recenter: true });
      },
      { signal: controller.signal },
    );

    const unsubscribeResize = isResizing.on("change", (resizing) => {
      if (!resizing) {
        queueSync(true);
      }
    });

    return () => {
      unsubscribeResize();
      controller.abort();

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [
    columns.total,
    columns.center,
    columns.count,
    setCurrentDate,
    setExternalAnchor,
    setVisibleRange,
    isResizing,
  ]);

  if (!bufferState.result) {
    throw new Error("InfiniteWeekViewDayProvider buffer was not initialized");
  }

  const value = {
    days: bufferState.result.items as VirtualizedDay[],
    columns,
    anchor,
    window: bufferState.result.window,
    range: bufferState.result.range,
    scrollRef,
  };

  return (
    <InfiniteWeekViewDayContext value={value}>
      {children}
    </InfiniteWeekViewDayContext>
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
