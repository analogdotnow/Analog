"use client";

import * as React from "react";
import { useQueries } from "@tanstack/react-query";
import { Temporal } from "temporal-polyfill";

import { useProcessedDisplayItems } from "@/hooks/calendar/use-display-items";
import { useSelectDisplayItems } from "@/hooks/calendar/use-events";
import type { DisplayItem } from "@/lib/display-item";
import { useTRPC } from "@/lib/trpc/client";
import { CalendarStoreContext } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

const CHUNK_DAYS = 60;
// Retention: at most ~2 years of chunks are kept; extending past the cap
// evicts from the far side.
const MAX_CHUNKS = 12;
// Auto-extension through empty stretches stops once the window edge is more
// than ~1 year past the nearest loaded event (or the window anchor).
const AUTO_EXTEND_LIMIT_DAYS = 370;

const EPOCH = Temporal.PlainDate.from("1970-01-01");

function chunkIndexOf(date: Temporal.PlainDate) {
  return Math.floor(date.since(EPOCH).days / CHUNK_DAYS);
}

function chunkStart(index: number) {
  return EPOCH.add({ days: index * CHUNK_DAYS });
}

interface ChunkRange {
  start: number;
  end: number;
}

function chunkRangeAround(date: Temporal.PlainDate): ChunkRange {
  return {
    start: chunkIndexOf(date.subtract({ days: CHUNK_DAYS })),
    end: chunkIndexOf(date.add({ days: CHUNK_DAYS })),
  };
}

function laterDate(a: Temporal.PlainDate, b: Temporal.PlainDate) {
  return Temporal.PlainDate.compare(a, b) >= 0 ? a : b;
}

function earlierDate(a: Temporal.PlainDate, b: Temporal.PlainDate) {
  return Temporal.PlainDate.compare(a, b) <= 0 ? a : b;
}

export interface AgendaViewDayGroup {
  key: string;
  date: Temporal.PlainDate;
  items: DisplayItem[];
}

interface AgendaViewContextValue {
  days: AgendaViewDayGroup[];
  loadedStart: Temporal.PlainDate;
  loadedEnd: Temporal.PlainDate;
  isPending: boolean;
  canExtendBackward: boolean;
  canExtendForward: boolean;
  extendBackward: () => void;
  extendForward: () => void;
  resetWindowAround: (date: Temporal.PlainDate) => void;
}

const AgendaViewContext = React.createContext<AgendaViewContextValue | null>(
  null,
);
AgendaViewContext.displayName = "AgendaViewContext";

interface AgendaViewProviderProps {
  children: React.ReactNode;
}

export function AgendaViewProvider({ children }: AgendaViewProviderProps) {
  "use memo";

  const store = React.use(CalendarStoreContext);

  if (!store) {
    throw new Error(
      "AgendaViewProvider must be used within CalendarStoreProvider",
    );
  }

  // The window is initialized from mount-time currentDate only; afterwards it
  // moves exclusively through extension and teleport resets.
  const [anchorDate, setAnchorDate] = React.useState(
    () => store.getState().currentDate,
  );
  const [range, setRange] = React.useState(() => chunkRangeAround(anchorDate));

  const trpc = useTRPC();
  const defaultTimeZone = useDefaultTimeZone();
  const select = useSelectDisplayItems();

  const chunkIndices = React.useMemo(
    () =>
      Array.from(
        { length: range.end - range.start + 1 },
        (_, offset) => range.start + offset,
      ),
    [range],
  );

  const { items: chunkItems, isPending } = useQueries({
    queries: chunkIndices.map((index) =>
      trpc.events.list.queryOptions(
        {
          timeMin: chunkStart(index).toZonedDateTime({
            timeZone: defaultTimeZone,
          }),
          timeMax: chunkStart(index + 1).toZonedDateTime({
            timeZone: defaultTimeZone,
          }),
          defaultTimeZone,
        },
        { select },
      ),
    ),
    combine: (results) => ({
      items: results.flatMap((result) => result.data ?? []),
      isPending: results.some((result) => result.isPending),
    }),
  });

  const items = React.useMemo(() => {
    // Adjacent chunk queries can both return an item spanning their boundary.
    const seen = new Set<string>();
    const deduped: DisplayItem[] = [];

    for (const item of chunkItems) {
      if (seen.has(item.id)) {
        continue;
      }

      seen.add(item.id);
      deduped.push(item);
    }

    return deduped;
  }, [chunkItems]);

  const processedItems = useProcessedDisplayItems(items);

  const loadedStart = chunkStart(range.start);
  const loadedEnd = chunkStart(range.end + 1).subtract({ days: 1 });

  const days = React.useMemo(() => {
    const buckets = new Map<string, DisplayItem[]>();

    for (const item of processedItems) {
      let day = laterDate(item.date.start, loadedStart);
      const end = earlierDate(item.date.end, loadedEnd);

      while (Temporal.PlainDate.compare(day, end) <= 0) {
        const key = day.toString();
        const bucket = buckets.get(key);

        if (bucket) {
          bucket.push(item);
        } else {
          buckets.set(key, [item]);
        }

        day = day.add({ days: 1 });
      }
    }

    return [...buckets.keys()].sort().map((key) => ({
      key,
      date: Temporal.PlainDate.from(key),
      items: buckets.get(key)!,
    }));
  }, [processedItems, loadedStart, loadedEnd]);

  const firstLoadedDay = days[0]?.date ?? anchorDate;
  const lastLoadedDay = days.at(-1)?.date ?? anchorDate;

  const canExtendBackward =
    firstLoadedDay.since(loadedStart).days < AUTO_EXTEND_LIMIT_DAYS;
  const canExtendForward =
    loadedEnd.since(lastLoadedDay).days < AUTO_EXTEND_LIMIT_DAYS;

  const extendBackward = React.useCallback(() => {
    setRange((prev) => ({
      start: prev.start - 1,
      end: prev.end - prev.start >= MAX_CHUNKS - 1 ? prev.end - 1 : prev.end,
    }));
  }, []);

  const extendForward = React.useCallback(() => {
    setRange((prev) => ({
      start:
        prev.end - prev.start >= MAX_CHUNKS - 1 ? prev.start + 1 : prev.start,
      end: prev.end + 1,
    }));
  }, []);

  const resetWindowAround = React.useCallback((date: Temporal.PlainDate) => {
    setAnchorDate(date);
    setRange(chunkRangeAround(date));
  }, []);

  const value = {
    days,
    loadedStart,
    loadedEnd,
    isPending,
    canExtendBackward,
    canExtendForward,
    extendBackward,
    extendForward,
    resetWindowAround,
  };

  return <AgendaViewContext value={value}>{children}</AgendaViewContext>;
}

export function useAgendaView() {
  const context = React.use(AgendaViewContext);

  if (!context) {
    throw new Error("useAgendaView must be used within an AgendaViewProvider");
  }

  return context;
}
