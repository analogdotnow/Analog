import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { startOfWeek } from "@repo/temporal";

import { useCalendarStore } from "@/providers/calendar-store-provider";

const DAYS_IN_WEEK = 7;

interface SnapColumnsProps {
  columnCount: number;
}

export function SnapColumns({ columnCount }: SnapColumnsProps) {
  "use memo";

  return (
    <div className="pointer-events-none absolute inset-0 grid auto-cols-fr grid-flow-col">
      {Array.from({ length: columnCount }, (_, idx) => (
        <div className="snap-start" key={idx} />
      ))}
    </div>
  );
}

interface GetWeekStartSnapIndicesOptions {
  anchor: Temporal.PlainDate;
  columnCount: number;
  columnCenter: number;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

function getWeekStartSnapIndices({
  anchor,
  columnCount,
  columnCenter,
  weekStartsOn,
}: GetWeekStartSnapIndicesOptions) {
  if (columnCount <= 0) {
    return [];
  }

  const anchorWeekOffset = anchor.since(
    startOfWeek(anchor, { weekStartsOn }),
  ).days;
  const anchorWeekStartIndex = columnCenter - anchorWeekOffset;

  const firstIndex =
    anchorWeekStartIndex +
    Math.ceil((0 - anchorWeekStartIndex) / DAYS_IN_WEEK) * DAYS_IN_WEEK;
  const lastIndex =
    anchorWeekStartIndex +
    Math.floor((columnCount - 1 - anchorWeekStartIndex) / DAYS_IN_WEEK) *
      DAYS_IN_WEEK;

  if (firstIndex > lastIndex) {
    return [];
  }

  const indices: number[] = [];

  for (let index = firstIndex; index <= lastIndex; index += DAYS_IN_WEEK) {
    indices.push(index);
  }

  return indices;
}

interface SnapWeeksProps {
  anchor: Temporal.PlainDate;
  columnCount: number;
  columnCenter: number;
  columnFraction: number;
}

export function SnapWeeks({
  anchor,
  columnCount,
  columnCenter,
  columnFraction,
}: SnapWeeksProps) {
  "use memo";

  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const weekStartIndices = getWeekStartSnapIndices({
    anchor,
    columnCount,
    columnCenter,
    weekStartsOn,
  });

  return (
    <div className="pointer-events-none absolute inset-0">
      {weekStartIndices.map((index) => (
        <div
          className="absolute inset-y-0 w-px snap-start snap-always"
          key={index}
          style={{
            left: `${columnFraction * index}%`,
          }}
        />
      ))}
    </div>
  );
}
