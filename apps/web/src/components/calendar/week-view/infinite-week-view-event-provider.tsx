"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isSameDay } from "@repo/temporal";

import type { PositionedDisplayItem } from "@/components/calendar/utils/positioning/inline-items";
import type { PositionedSideItem } from "@/components/calendar/utils/positioning/side-items";
import {
  useRingBufferSelector,
  useRingBufferStore,
} from "@/lib/data-structures/use-ring-buffer";
import {
  BUFFER_COUNT,
  useInfiniteWeekViewDays,
  type VisualizedColumns,
} from "./infinite-week-view-day-provider";
import { useInfiniteWeekView } from "./infinite-week-view-provider";

export interface VirtualizedDayEvents {
  date: Temporal.PlainDate;
  index: number;
  style: {
    left: string;
  };
  items: PositionedDisplayItem[];
  sideItems: PositionedSideItem[];
}

interface InfiniteWeekViewEventContextValue {
  items: VirtualizedDayEvents[];
}

const InfiniteWeekViewEventContext =
  React.createContext<InfiniteWeekViewEventContextValue | null>(null);

interface InfiniteWeekViewEventProviderProps {
  children: React.ReactNode;
}

export function InfiniteWeekViewEventProvider({
  children,
}: InfiniteWeekViewEventProviderProps) {
  "use memo";

  const { collection } = useInfiniteWeekView();
  const { anchor, columns, window } = useInfiniteWeekViewDays();

  const eventBuffer = useEventBuffer(columns.count + 2 * BUFFER_COUNT);

  React.useLayoutEffect(() => {
    eventBuffer.update(
      window.start,
      window.end,
      anchor,
      columns,
      collection.items,
      collection.range.start,
    );
  }, [
    anchor,
    window.start,
    window.end,
    columns,
    collection.items,
    collection.range.start,
    eventBuffer,
  ]);

  const value = React.useMemo(
    () => ({
      items: eventBuffer.items,
    }),
    [eventBuffer.items],
  );

  return (
    <InfiniteWeekViewEventContext value={value}>
      {children}
    </InfiniteWeekViewEventContext>
  );
}

export function useInfiniteWeekViewEvents() {
  const context = React.use(InfiniteWeekViewEventContext);

  if (!context) {
    throw new Error(
      "useInfiniteWeekViewEvents must be used within an InfiniteWeekViewEventProvider",
    );
  }

  return context;
}

interface EventBufferState {
  anchor: Temporal.PlainDate;
  start: number;
  end: number;
  collection: Collection;
}

interface Collection {
  positionedItems: PositionedDisplayItem[][];
  positionedSideItems: PositionedSideItem[][];
}

interface CreateEventsOptions {
  start: number;
  end: number;
  anchor: Temporal.PlainDate;
  columns: VisualizedColumns;
  collection: Collection;
  collectionStart: Temporal.PlainDate;
}

function createEvents({
  start,
  end,
  anchor,
  columns,
  collection,
  collectionStart,
}: CreateEventsOptions) {
  const events: VirtualizedDayEvents[] = [];
  const anchorCollectionOffset = anchor.since(collectionStart).days;

  for (let index = start; index <= end; index++) {
    const dayOffset = index - columns.center;
    const daysIndex = anchorCollectionOffset + dayOffset;

    events.push({
      date: anchor.add({ days: dayOffset }),
      index,
      style: {
        left: `${50 + columns.fraction * (dayOffset - columns.count)}%`,
      },
      items: collection.positionedItems[daysIndex] ?? [],
      sideItems: collection.positionedSideItems[daysIndex] ?? [],
    });
  }

  return events;
}

function useEventBuffer(capacity: number) {
  "use memo";

  const store = useRingBufferStore<VirtualizedDayEvents>(capacity);

  const state = React.useRef<EventBufferState | null>(null);

  const isRangeOverlapping = (start: number, end: number) => {
    if (state.current === null) {
      return false;
    }

    return end >= state.current.start && start <= state.current.end;
  };

  const update = (
    start: number,
    end: number,
    anchor: Temporal.PlainDate,
    columns: VisualizedColumns,
    collection: Collection,
    collectionStart: Temporal.PlainDate,
  ) => {
    const collectionChanged =
      state.current === null ? true : state.current.collection !== collection;

    if (
      state.current === null ||
      !isSameDay(state.current.anchor, anchor) ||
      !isRangeOverlapping(start, end) ||
      collectionChanged
    ) {
      store.replace(
        createEvents({
          start,
          end,
          anchor,
          columns,
          collection,
          collectionStart,
        }),
      );
      state.current = { anchor, start, end, collection };

      return;
    }

    const delta = start - state.current.start;

    if (delta === 0) {
      state.current = { anchor, start, end, collection };

      return;
    }

    if (delta > 0) {
      store.enqueueRightMany(
        createEvents({
          start: state.current.end + 1,
          end,
          anchor,
          columns,
          collection,
          collectionStart,
        }),
      );

      state.current = { anchor, start, end, collection };

      return;
    }

    store.enqueueLeftMany(
      createEvents({
        start,
        end: state.current.start - 1,
        anchor,
        columns,
        collection,
        collectionStart,
      }),
    );

    state.current = { anchor, start, end, collection };
  };

  const items = useRingBufferSelector(
    store,
    (snap) => snap.items as VirtualizedDayEvents[],
  );

  return { items, update, isRangeOverlapping };
}
