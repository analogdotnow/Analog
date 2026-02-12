"use client";

// Required to ensure the scroll position is reset on fast refresh
// @refresh reset
import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { endOfWeek, isSameDay, startOfWeek } from "@repo/temporal";

import { useIsResizing } from "@/hooks/use-resize";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useSetVisibleRange } from "@/store/hooks";
import {
  derivedMonthWeekBufferReducer,
  type DerivedMonthWeekBufferState,
} from "./derived-month-week-buffer-reducer";
import {
  DEFAULT_MONTH_WEEK_BUFFER_COUNT,
  deriveMonthWeekBufferResult,
  deriveMonthWeekBufferSnapshot,
  type DerivedMonthWeek,
  type DerivedMonthWeekBufferInput,
} from "./use-derived-month-week-buffer";

export type VirtualizedWeek = DerivedMonthWeek;

export interface VisualizedRows {
  count: number;
  total: number;
  fraction: number;
  center: number;
}

const VISIBLE_ROWS = 6;
const SCROLL_MULTIPLIER = 50;
const BUFFER_COUNT = DEFAULT_MONTH_WEEK_BUFFER_COUNT;
const EDGE_THRESHOLD = 0.1;

export function useVisualizedRows() {
  "use memo";

  const total = SCROLL_MULTIPLIER * VISIBLE_ROWS;
  const fraction = 2.0 / VISIBLE_ROWS;
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

function centerScrollPosition(scrollElement: HTMLElement) {
  scrollElement.scrollTo({
    top: scrollElement.scrollHeight / 2,
    behavior: "instant",
  });
}

interface InfiniteMonthViewWeekContextValue {
  weeks: VirtualizedWeek[];
  rows: VisualizedRows;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const InfiniteMonthViewWeekContext =
  React.createContext<InfiniteMonthViewWeekContextValue | null>(null);
InfiniteMonthViewWeekContext.displayName = "InfiniteMonthViewWeekContext";

interface InfiniteMonthViewWeekProviderProps {
  children: React.ReactNode;
}

function createBufferState(
  input: DerivedMonthWeekBufferInput,
): DerivedMonthWeekBufferState {
  const snapshot = deriveMonthWeekBufferSnapshot(null, input);

  return {
    snapshot,
    result: deriveMonthWeekBufferResult(snapshot, input),
  };
}

export function InfiniteMonthViewWeekProvider({
  children,
}: InfiniteMonthViewWeekProviderProps) {
  "use memo";

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const currentDate = useCalendarStore((s) => s.currentDate);
  const anchor = useCalendarStore((s) => s.anchor);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const isResizing = useIsResizing(scrollRef);

  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate);
  const setExternalAnchor = useCalendarStore((s) => s.setAnchor);
  const setVisibleRange = useSetVisibleRange();

  const rows = useVisualizedRows();

  const scrollAnchorRef = React.useRef(
    startOfWeek(currentDate, { weekStartsOn }),
  );
  const [baseIndex, setBaseIndex] = React.useState(
    () => rows.center - BUFFER_COUNT,
  );
  const latestScroll = React.useRef<Temporal.PlainDate | null>(null);

  const normalizedAnchor = React.useMemo(
    () => startOfWeek(anchor, { weekStartsOn }),
    [anchor, weekStartsOn],
  );

  const [bufferState, dispatchBuffer] = React.useReducer(
    derivedMonthWeekBufferReducer,
    {
      anchor: normalizedAnchor,
      rows,
      baseIndex,
      weekStartsOn,
      bufferCount: BUFFER_COUNT,
    },
    createBufferState,
  );

  React.useLayoutEffect(() => {
    const currentWeekStart = startOfWeek(currentDate, { weekStartsOn });

    if (latestScroll.current) {
      const latestWeekStart = startOfWeek(latestScroll.current, {
        weekStartsOn,
      });

      if (isSameDay(latestWeekStart, currentWeekStart)) {
        latestScroll.current = null;

        return;
      }
    }

    latestScroll.current = null;
    setBaseIndex(rows.center - BUFFER_COUNT);
    setExternalAnchor(currentWeekStart);

    if (!isSameDay(scrollAnchorRef.current, currentWeekStart)) {
      scrollAnchorRef.current = currentWeekStart;
    }

    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    centerScrollPosition(scrollElement);
  }, [currentDate, weekStartsOn, rows.center, setExternalAnchor]);

  React.useLayoutEffect(() => {
    dispatchBuffer({
      type: "derive",
      input: {
        anchor: normalizedAnchor,
        rows,
        baseIndex,
        weekStartsOn,
        bufferCount: BUFFER_COUNT,
      },
    });
  }, [normalizedAnchor, rows, baseIndex, weekStartsOn]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const setCurrentWeekWindow = (start: Temporal.PlainDate) => {
      latestScroll.current = start;

      setCurrentDate(start);
      setVisibleRange({
        start,
        end: endOfWeek(start.add({ weeks: rows.count - 1 }), {
          weekStartsOn,
        }),
      });
    };

    const centeredBaseIndex = rows.center - BUFFER_COUNT;

    const getCurrentOffset = () => {
      const rowHeight = scrollElement.scrollHeight / rows.total;

      return Math.round(scrollElement.scrollTop / rowHeight);
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
      const shouldCenter = recenter || exceededThreshold(scrollElement);
      const start = scrollAnchorAtSync.add({
        weeks: nextOffset - rows.center,
      });

      if (shouldCenter) {
        if (!isSameDay(start, scrollAnchorAtSync)) {
          scrollAnchorRef.current = start;
          setExternalAnchor(start);
        }

        centerScrollPosition(scrollElement);
        setBaseIndex(centeredBaseIndex);
        setCurrentWeekWindow(start);

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
      setCurrentWeekWindow(start);
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
    rows.total,
    rows.center,
    rows.count,
    weekStartsOn,
    setCurrentDate,
    setExternalAnchor,
    setVisibleRange,
    isResizing,
  ]);

  if (!bufferState.result) {
    throw new Error("InfiniteMonthViewWeekProvider buffer was not initialized");
  }

  const bufferResult = bufferState.result;

  const value = React.useMemo(
    () => ({
      weeks: bufferResult.items as VirtualizedWeek[],
      rows,
      scrollRef,
    }),
    [bufferResult.items, rows],
  );

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
