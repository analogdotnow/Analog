import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { startOfMonth, startOfWeek } from "@repo/temporal";

import { useCalendarStore } from "@/providers/calendar-store-provider";

type WeekStartsOn = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface SnapRowsProps {
  rowCount: number;
}

export function SnapRows({ rowCount }: SnapRowsProps) {
  "use memo";

  return (
    <div className="pointer-events-none absolute inset-0 grid grid-flow-row auto-rows-fr">
      {Array.from({ length: rowCount }, (_, idx) => (
        <div className="snap-start" key={idx} />
      ))}
    </div>
  );
}

interface GetMonthStartSnapIndicesOptions {
  anchor: Temporal.PlainDate;
  rowCount: number;
  rowCenter: number;
  weekStartsOn: WeekStartsOn;
}

function getMonthStartWeek(
  date: Temporal.PlainDate,
  weekStartsOn: WeekStartsOn,
) {
  return startOfWeek(startOfMonth(date), { weekStartsOn });
}

function getMonthStartSnapIndices({
  anchor,
  rowCount,
  rowCenter,
  weekStartsOn,
}: GetMonthStartSnapIndicesOptions) {
  if (rowCount <= 0) {
    return [];
  }

  const anchorWeekStart = startOfWeek(anchor, { weekStartsOn });
  const anchorMonthStartDate = anchorWeekStart.with({ day: 1 });
  const anchorMonthStartWeek = startOfWeek(anchorMonthStartDate, {
    weekStartsOn,
  });
  const anchorMonthOffsetWeeks = anchorWeekStart.since(anchorMonthStartWeek, {
    largestUnit: "weeks",
  }).weeks;
  const anchorMonthStartIndex = rowCenter - anchorMonthOffsetWeeks;

  const forward: number[] = [];
  let forwardMonth = anchorMonthStartDate;
  let forwardMonthWeek = anchorMonthStartWeek;
  let forwardIndex = anchorMonthStartIndex;

  while (forwardIndex < rowCount - 1) {
    const nextMonth = forwardMonth.add({ months: 1 });
    const nextMonthWeek = getMonthStartWeek(nextMonth, weekStartsOn);
    const step = nextMonthWeek.since(forwardMonthWeek, {
      largestUnit: "weeks",
    }).weeks;

    forwardIndex += step;
    forwardMonth = nextMonth;
    forwardMonthWeek = nextMonthWeek;

    if (forwardIndex > rowCount - 1) {
      break;
    }

    forward.push(forwardIndex);
  }

  const backward: number[] = [];
  let backwardMonth = anchorMonthStartDate;
  let backwardMonthWeek = anchorMonthStartWeek;
  let backwardIndex = anchorMonthStartIndex;

  while (backwardIndex > 0) {
    const prevMonth = backwardMonth.subtract({ months: 1 });
    const prevMonthWeek = getMonthStartWeek(prevMonth, weekStartsOn);
    const step = backwardMonthWeek.since(prevMonthWeek, {
      largestUnit: "weeks",
    }).weeks;

    backwardIndex -= step;
    backwardMonth = prevMonth;
    backwardMonthWeek = prevMonthWeek;

    if (backwardIndex < 0) {
      break;
    }

    backward.push(backwardIndex);
  }

  backward.reverse();
  backward.push(anchorMonthStartIndex, ...forward);
  return backward;
}

interface SnapMonthsProps {
  rowCount: number;
  rowCenter: number;
  rowFraction: number;
}

export function SnapMonths({
  rowCount,
  rowCenter,
  rowFraction,
}: SnapMonthsProps) {
  "use memo";

  const anchor = useCalendarStore((s) => s.anchor);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const monthStartIndices = React.useMemo(
    () =>
      getMonthStartSnapIndices({
        anchor,
        rowCount,
        rowCenter,
        weekStartsOn,
      }),
    [anchor, rowCount, rowCenter, weekStartsOn],
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {monthStartIndices.map((index) => (
        <div
          className="absolute inset-x-0 h-px snap-start snap-always"
          key={index}
          style={{
            top: `${rowFraction * index}%`,
          }}
        />
      ))}
    </div>
  );
}
