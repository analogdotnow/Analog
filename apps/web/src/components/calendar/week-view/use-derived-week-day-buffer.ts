// Required to ensure the scroll position is reset on fast refresh
// @refresh reset

import { Temporal } from "temporal-polyfill";

import type { PositionedDisplayItem } from "@/components/calendar/utils/positioning/inline-items";
import type { PositionedSideItem } from "@/components/calendar/utils/positioning/side-items";
import type { WeekDisplayCollection } from "@/hooks/calendar/use-event-collection";
import {
  deriveRingBufferSnapshot,
  type RingMeta,
  type RingSnapshot,
} from "@/lib/data-structures/derive-ring-buffer";

export const DEFAULT_WEEK_DAY_BUFFER_COUNT = 14;

export interface DerivedWeekDay {
  date: Temporal.PlainDate;
  index: number;
  items: PositionedDisplayItem[];
  sideItems: PositionedSideItem[];
}

interface WeekDayColumns {
  count: number;
  center: number;
}

export interface DerivedWeekDayBufferInput {
  anchor: Temporal.PlainDate;
  columns: WeekDayColumns;
  collection: WeekDisplayCollection;
  collectionStart: Temporal.PlainDate;
  baseIndex: number;
  bufferCount?: number;
  forceReplace?: boolean;
}

export type DerivedWeekDayBufferSnapshot = RingSnapshot<
  DerivedWeekDay,
  Temporal.PlainDate
>;

export interface DerivedWeekDayBufferResult {
  snapshot: DerivedWeekDayBufferSnapshot;
  items: readonly DerivedWeekDay[];
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  window: {
    start: number;
    end: number;
  };
  meta: RingMeta<Temporal.PlainDate>;
}

interface CreateDerivedWeekDaysOptions {
  start: Temporal.PlainDate;
  count: number;
  columnsCenter: number;
  collection: WeekDisplayCollection;
  collectionStart: Temporal.PlainDate;
  anchorOffset: number;
}

function createDerivedWeekDays({
  start,
  count,
  columnsCenter,
  collection,
  collectionStart,
  anchorOffset,
}: CreateDerivedWeekDaysOptions): DerivedWeekDay[] {
  if (count <= 0) {
    return [];
  }

  const days: DerivedWeekDay[] = [];
  const baseOffset = start.since(collectionStart).days;

  for (let i = 0; i < count; i++) {
    const date = start.add({ days: i });
    const daysIndex = baseOffset + i;

    days.push({
      date,
      index: columnsCenter + anchorOffset + i,
      items: collection.positionedItems[daysIndex] ?? [],
      sideItems: collection.positionedSideItems[daysIndex] ?? [],
    });
  }

  return days;
}

function getWeekDayBufferConfigVersion({
  columnsCount,
  columnsCenter,
  bufferCount,
}: {
  columnsCount: number;
  columnsCenter: number;
  bufferCount: number;
}) {
  return `week-day-buffer:v2:columns=${columnsCount};center=${columnsCenter};buffer=${bufferCount}`;
}

function getBaseIndexOffset({
  baseIndex,
  columnsCenter,
  bufferCount,
}: {
  baseIndex: number;
  columnsCenter: number;
  bufferCount: number;
}) {
  const centeredBaseIndex = columnsCenter - bufferCount;

  return baseIndex - centeredBaseIndex;
}

export function deriveWeekDayBufferSnapshot(
  previous: DerivedWeekDayBufferSnapshot | null,
  input: DerivedWeekDayBufferInput,
) {
  const columnsCount = input.columns.count;
  const columnsCenter = input.columns.center;
  const baseIndex = input.baseIndex;
  const bufferCount = input.bufferCount ?? DEFAULT_WEEK_DAY_BUFFER_COUNT;
  const capacity = columnsCount + 2 * bufferCount;
  const baseIndexOffset = getBaseIndexOffset({
    baseIndex,
    columnsCenter,
    bufferCount,
  });
  const derivedAnchor = input.anchor.add({ days: baseIndexOffset });
  const configVersion = getWeekDayBufferConfigVersion({
    columnsCount,
    columnsCenter,
    bufferCount,
  });

  return deriveRingBufferSnapshot({
    previous,
    capacity,
    anchor: derivedAnchor,
    sourceVersion: input.collection,
    configVersion,
    forceReplace: input.forceReplace,
    getWindow: (anchor) => {
      const start = anchor.subtract({ days: bufferCount });
      const width = capacity > 0 ? capacity - 1 : 0;
      const end = start.add({ days: width });

      return { start, end };
    },
    compareCursor: Temporal.PlainDate.compare,
    addCursor: (cursor, amount) => cursor.add({ days: amount }),
    deltaFromAnchor: (previousAnchor, nextAnchor) =>
      nextAnchor.since(previousAnchor).days,
    createRange: ({ start, count }) =>
      createDerivedWeekDays({
        start,
        count,
        columnsCenter,
        collection: input.collection,
        collectionStart: input.collectionStart,
        anchorOffset: start.since(input.anchor).days,
      }),
  });
}

export function deriveWeekDayBufferResult(
  snapshot: DerivedWeekDayBufferSnapshot,
  input: Pick<
    DerivedWeekDayBufferInput,
    "columns" | "baseIndex" | "bufferCount"
  >,
): DerivedWeekDayBufferResult {
  const columnsCenter = input.columns.center;
  const baseIndex = input.baseIndex;
  const bufferCount = input.bufferCount ?? DEFAULT_WEEK_DAY_BUFFER_COUNT;
  const windowStart = getBaseIndexOffset({
    baseIndex,
    columnsCenter,
    bufferCount,
  });

  return {
    snapshot,
    items: snapshot.items,
    range: {
      start: snapshot.meta.start,
      end: snapshot.meta.end,
    },
    window: {
      start: windowStart,
      end: windowStart + snapshot.meta.capacity - 1,
    },
    meta: snapshot.meta,
  };
}
