import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { startOfMonth } from "@repo/temporal";

import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { epochWeekOf } from "./infinite-month-view-week-provider";

interface GetMonthStartWeeksOptions {
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

function getMonthStartWeeks({
  range,
  weekStartsOn,
}: GetMonthStartWeeksOptions) {
  const weeks: number[] = [];

  let monthStart = startOfMonth(range.start);

  if (Temporal.PlainDate.compare(monthStart, range.start) < 0) {
    monthStart = monthStart.add({ months: 1 });
  }

  while (Temporal.PlainDate.compare(monthStart, range.end) <= 0) {
    weeks.push(epochWeekOf(monthStart, weekStartsOn));
    monthStart = monthStart.add({ months: 1 });
  }

  return weeks;
}

interface SnapRowsProps {
  rows: number;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  trackBase: number;
}

// Month-start stops live on the row cells themselves rather than on separate
// snap-line elements: WebKit mis-settles when a snap target sits exactly on
// top of another one (the old 1px month lines were co-located with row
// cells), landing scrolls a row off or re-snapping ±1 row after settling in
// Safari. One snap target per slot, with snap-always toggled per slot, is
// stable in both engines and keeps the fling-stops-at-each-month behavior.
export function SnapRows({ rows, range, trackBase }: SnapRowsProps) {
  "use memo";

  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const monthStartSlots = new Set(
    getMonthStartWeeks({ range, weekStartsOn }).map((week) => week - trackBase),
  );

  return (
    <div className="pointer-events-none absolute inset-0 grid grid-flow-row auto-rows-fr">
      {Array.from({ length: rows }, (_, idx) => (
        <div
          className={cn("snap-start", monthStartSlots.has(idx) && "snap-always")}
          key={idx}
        />
      ))}
    </div>
  );
}
