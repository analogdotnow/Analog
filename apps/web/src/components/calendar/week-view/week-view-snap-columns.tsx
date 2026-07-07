import * as React from "react";

const DAYS_IN_WEEK = 7;

interface WeekViewSnapColumnsProps {
  columnCount: number;
}

export function WeekViewSnapColumns({ columnCount }: WeekViewSnapColumnsProps) {
  "use memo";

  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: columnCount }, (_, idx) => (
        <div
          className="absolute inset-y-0 w-px snap-start"
          key={idx}
          style={{ left: `${(100 / columnCount) * idx}%` }}
        />
      ))}
    </div>
  );
}

interface GetWeekStartSnapIndicesOptions {
  columnCount: number;
  columnCenter: number;
}

function getWeekStartSnapIndices({
  columnCount,
  columnCenter,
}: GetWeekStartSnapIndicesOptions) {
  const indices: number[] = [];

  for (
    let index = columnCenter % DAYS_IN_WEEK;
    index < columnCount;
    index += DAYS_IN_WEEK
  ) {
    indices.push(index);
  }

  return indices;
}

interface WeekStartSnapGuidelineProps {
  columnCount: number;
  columnCenter: number;
  columnFraction: number;
}

export function WeekStartSnapGuideline({
  columnCount,
  columnCenter,
  columnFraction,
}: WeekStartSnapGuidelineProps) {
  "use memo";

  const weekStartIndices = getWeekStartSnapIndices({
    columnCount,
    columnCenter,
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
