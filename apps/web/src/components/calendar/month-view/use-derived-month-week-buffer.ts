// Required to ensure the scroll position is reset on fast refresh
// @refresh reset

import { Temporal } from "temporal-polyfill";

import { eachDayOfInterval, endOfWeek } from "@repo/temporal";

import {
  deriveRingBufferSnapshot,
  type RingMeta,
  type RingSnapshot,
} from "@/lib/data-structures/derive-ring-buffer";

export const DEFAULT_MONTH_WEEK_BUFFER_COUNT = 12;

interface MonthRows {
  count: number;
  center: number;
}

type WeekStartsOn = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DerivedMonthWeek {
  index: number;
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
  days: Temporal.PlainDate[];
}

export interface DerivedMonthWeekBufferInput {
  anchor: Temporal.PlainDate;
  rows: MonthRows;
  baseIndex: number;
  weekStartsOn: WeekStartsOn;
  bufferCount?: number;
  forceReplace?: boolean;
}

export type DerivedMonthWeekBufferSnapshot = RingSnapshot<
  DerivedMonthWeek,
  Temporal.PlainDate
>;

export interface DerivedMonthWeekBufferResult {
  snapshot: DerivedMonthWeekBufferSnapshot;
  items: readonly DerivedMonthWeek[];
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

interface CreateDerivedMonthWeeksOptions {
  start: Temporal.PlainDate;
  count: number;
  rowsCenter: number;
  weekStartsOn: WeekStartsOn;
  anchorOffset: number;
}

function createDerivedMonthWeeks({
  start,
  count,
  rowsCenter,
  weekStartsOn,
  anchorOffset,
}: CreateDerivedMonthWeeksOptions) {
  if (count <= 0) {
    return [];
  }

  const weeks: DerivedMonthWeek[] = [];

  for (let i = 0; i < count; i++) {
    const weekStart = start.add({ weeks: i });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn });

    weeks.push({
      start: weekStart,
      end: weekEnd,
      days: eachDayOfInterval(weekStart, weekEnd),
      index: rowsCenter + anchorOffset + i,
    });
  }

  return weeks;
}

function getMonthWeekBufferConfigVersion({
  rowsCount,
  rowsCenter,
  bufferCount,
  weekStartsOn,
}: {
  rowsCount: number;
  rowsCenter: number;
  bufferCount: number;
  weekStartsOn: WeekStartsOn;
}) {
  return `month-week-buffer:v1:rows=${rowsCount};center=${rowsCenter};buffer=${bufferCount};weekStartsOn=${weekStartsOn}`;
}

function getMonthWeekBufferSourceVersion({
  anchor,
  weekStartsOn,
}: {
  anchor: Temporal.PlainDate;
  weekStartsOn: WeekStartsOn;
}) {
  return `month-week-source:v1:anchor=${anchor.toString()};weekStartsOn=${weekStartsOn}`;
}

function getBaseIndexOffset({
  baseIndex,
  rowsCenter,
  bufferCount,
}: {
  baseIndex: number;
  rowsCenter: number;
  bufferCount: number;
}) {
  const centeredBaseIndex = rowsCenter - bufferCount;

  return baseIndex - centeredBaseIndex;
}

export function deriveMonthWeekBufferSnapshot(
  previous: DerivedMonthWeekBufferSnapshot | null,
  input: DerivedMonthWeekBufferInput,
) {
  const rowsCount = input.rows.count;
  const rowsCenter = input.rows.center;
  const baseIndex = input.baseIndex;
  const bufferCount = input.bufferCount ?? DEFAULT_MONTH_WEEK_BUFFER_COUNT;
  const capacity = rowsCount + 2 * bufferCount;
  const baseIndexOffset = getBaseIndexOffset({
    baseIndex,
    rowsCenter,
    bufferCount,
  });
  const derivedAnchor = input.anchor.add({ weeks: baseIndexOffset });
  const configVersion = getMonthWeekBufferConfigVersion({
    rowsCount,
    rowsCenter,
    bufferCount,
    weekStartsOn: input.weekStartsOn,
  });
  const sourceVersion = getMonthWeekBufferSourceVersion({
    anchor: input.anchor,
    weekStartsOn: input.weekStartsOn,
  });

  return deriveRingBufferSnapshot({
    previous,
    capacity,
    anchor: derivedAnchor,
    sourceVersion,
    configVersion,
    forceReplace: input.forceReplace,
    getWindow: (anchor) => {
      const start = anchor.subtract({ weeks: bufferCount });
      const width = capacity > 0 ? capacity - 1 : 0;
      const end = start.add({ weeks: width });

      return { start, end };
    },
    compareCursor: Temporal.PlainDate.compare,
    addCursor: (cursor, amount) => cursor.add({ weeks: amount }),
    deltaFromAnchor: (previousAnchor, nextAnchor) =>
      nextAnchor.since(previousAnchor, { largestUnit: "weeks" }).weeks,
    createRange: ({ start, count }) =>
      createDerivedMonthWeeks({
        start,
        count,
        rowsCenter,
        weekStartsOn: input.weekStartsOn,
        anchorOffset: start.since(input.anchor, { largestUnit: "weeks" }).weeks,
      }),
  });
}

export function deriveMonthWeekBufferResult(
  snapshot: DerivedMonthWeekBufferSnapshot,
  input: Pick<
    DerivedMonthWeekBufferInput,
    "rows" | "baseIndex" | "bufferCount"
  >,
) {
  const rowsCenter = input.rows.center;
  const baseIndex = input.baseIndex;
  const bufferCount = input.bufferCount ?? DEFAULT_MONTH_WEEK_BUFFER_COUNT;
  const windowStart = getBaseIndexOffset({
    baseIndex,
    rowsCenter,
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
