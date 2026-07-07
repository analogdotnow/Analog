import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { startOfMonth } from "@repo/temporal";

import { useCalendarStore } from "@/providers/calendar-store-provider";
import { epochWeekOf } from "./infinite-month-view-week-provider";

interface SnapRowsProps {
  rows: number;
}

export function SnapRows({ rows }: SnapRowsProps) {
  "use memo";

  return (
    <div className="pointer-events-none absolute inset-0 grid grid-flow-row auto-rows-fr">
      {Array.from({ length: rows }, (_, idx) => (
        <div className="snap-start" key={idx} />
      ))}
    </div>
  );
}

interface GetMonthStartWeeksOptions {
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

function getMonthStartWeeks({ range, weekStartsOn }: GetMonthStartWeeksOptions) {
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

interface SnapMonthsProps {
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  trackBase: number;
}

export function SnapMonths({ range, trackBase }: SnapMonthsProps) {
  "use memo";

  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const monthStartWeeks = getMonthStartWeeks({ range, weekStartsOn });

  // Lines are keyed and positioned by slot (not epoch week) so an existing
  // line never moves in content coordinates when --track-base shifts during a
  // recenter: under snap-mandatory, a moved snap target licenses the browser
  // to re-snap, which skips the view by the recenter delta. Slots churn
  // (unmount/mount) across recenters instead of moving.
  return (
    <div className="pointer-events-none absolute inset-0">
      {monthStartWeeks.map((week) => (
        <div
          className="absolute inset-x-0 top-(--row-offset) h-px snap-start snap-always [--row-offset:calc(var(--row-slot)*var(--row-height))]"
          key={week - trackBase}
          style={{ "--row-slot": week - trackBase }}
        />
      ))}
    </div>
  );
}
