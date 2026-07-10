"use client";

import * as React from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Temporal } from "temporal-polyfill";

import { useProcessedDisplayItems } from "@/hooks/calendar/use-display-items";
import { useSelectDisplayItems } from "@/hooks/calendar/use-events";
import { db, mapEventQueryInput } from "@/lib/db";
import { isEvent, type DisplayItem } from "@/lib/display-item";
import type { RouterOutputs } from "@/lib/trpc";
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
// Chunks kept warm beyond each extendable edge. Depth 1 is not enough: a
// fling consumes the warm chunk instantly, and extension then stalls a full
// round trip. At depth 2 the chunk behind the one being consumed is already
// in flight.
const PREFETCH_CHUNKS = 2;

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
  extendAround: () => void;
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
  const queryClient = useQueryClient();
  const defaultTimeZone = useDefaultTimeZone();
  const selectDisplayItems = useSelectDisplayItems();

  // Recurring masters ride along for Dexie persistence below; the shared
  // select would drop them.
  const select = React.useCallback(
    (data: RouterOutputs["events"]["list"]) => ({
      items: selectDisplayItems(data),
      recurringMasterEvents: data.recurringMasterEvents,
    }),
    [selectDisplayItems],
  );

  const chunkIndices = React.useMemo(
    () =>
      Array.from(
        { length: range.end - range.start + 1 },
        (_, offset) => range.start + offset,
      ),
    [range],
  );

  // Single source for the chunk query input: prefetched keys must match the
  // keys useQueries mounts, or the prefetch warms nothing.
  const chunkInput = React.useCallback(
    (index: number) => ({
      timeMin: chunkStart(index).toZonedDateTime({
        timeZone: defaultTimeZone,
      }),
      timeMax: chunkStart(index + 1).toZonedDateTime({
        timeZone: defaultTimeZone,
      }),
      defaultTimeZone,
    }),
    [defaultTimeZone],
  );

  const {
    items: chunkItems,
    recurringMasterEvents,
    isPending,
  } = useQueries({
    queries: chunkIndices.map((index) =>
      trpc.events.list.queryOptions(chunkInput(index), { select }),
    ),
    combine: (results) => ({
      items: results.flatMap((result) => result.data?.items ?? []),
      recurringMasterEvents: results.flatMap((result) =>
        Object.values(result.data?.recurringMasterEvents ?? {}),
      ),
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

  // Mirror of the global-query persistence in calendar-view: update/delete
  // flows and the event form resolve events through Dexie (getEventById), so
  // events that only exist in agenda chunks — beyond the shared
  // timeMin/timeMax window — must be persisted too or those flows abort.
  React.useEffect(() => {
    db.events.bulkPut(
      items.filter(isEvent).map((item) => mapEventQueryInput(item.event)),
    );

    // Every chunk overlapping a recurring series returns that series' master,
    // so dedupe by id before writing.
    const masters = new Map(
      recurringMasterEvents.map((event) => [event.id, event]),
    );

    db.events.bulkPut(
      [...masters.values()].map((event) => mapEventQueryInput(event)),
    );
  }, [items, recurringMasterEvents]);

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

  // Keep the next chunks on each extendable side warm so extensions mount as
  // cache hits instead of holding the user at the window edge for a network
  // round trip. Skipped only during a cold load (mount/teleport), when the
  // user is waiting on the visible window itself — a pending chunk at one
  // edge must NOT pause prefetching, or the pipeline dries up exactly while
  // a fling is draining the runway.
  React.useEffect(() => {
    if (isPending && days.length === 0) {
      return;
    }

    for (let depth = 1; depth <= PREFETCH_CHUNKS; depth++) {
      if (canExtendBackward) {
        void queryClient.prefetchQuery(
          trpc.events.list.queryOptions(chunkInput(range.start - depth)),
        );
      }

      if (canExtendForward) {
        void queryClient.prefetchQuery(
          trpc.events.list.queryOptions(chunkInput(range.end + depth)),
        );
      }
    }
  }, [
    isPending,
    days.length,
    canExtendBackward,
    canExtendForward,
    range,
    queryClient,
    trpc,
    chunkInput,
  ]);

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

  // Symmetric growth for the empty-window search. Calling extendBackward and
  // extendForward separately is NOT equivalent: at the MAX_CHUNKS cap each
  // evicts the opposite edge, so the pair recreates identical bounds as a new
  // object every pass and churns renders forever. Bailing with `prev` lets
  // React skip the update entirely.
  const extendAround = React.useCallback(() => {
    setRange((prev) => {
      const size = prev.end - prev.start + 1;

      if (size >= MAX_CHUNKS) {
        return prev;
      }

      return {
        start: prev.start - 1,
        end: size + 1 >= MAX_CHUNKS ? prev.end : prev.end + 1,
      };
    });
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
    extendAround,
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
