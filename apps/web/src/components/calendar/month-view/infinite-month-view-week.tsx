"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import {
  useMonthDisplayCollection,
  useWeekRowItems,
} from "@/hooks/calendar/use-event-collection";
import { useLaneCapacity } from "@/hooks/calendar/use-lane-capacity";
import { cn } from "@/lib/utils";
import { useInfiniteMonthView } from "./infinite-month-view-provider";
import { MonthViewDay, MonthViewDayOverflow } from "./month-view-day";
import { MonthViewItem } from "./month-view-item";

interface WeekData {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
  days: Temporal.PlainDate[];
}

interface InfiniteMonthViewWeekProps extends React.ComponentProps<"div"> {
  week: WeekData;
}

export function InfiniteMonthViewWeek({
  week,
  className,
  style,
  ...props
}: InfiniteMonthViewWeekProps) {
  "use memo";

  const overflowRef = React.useRef<HTMLDivElement | null>(null);

  const { items } = useInfiniteMonthView();
  const collection = useMonthDisplayCollection(items, week.days);

  const lanes = useWeekRowItems(collection, week);

  const capacity = useLaneCapacity(overflowRef);
  const overflowItems = lanes.slice(capacity).flat();

  return (
    <div
      className={cn(
        "relative grid min-w-0 grid-cols-(--month-view-grid)",
        className,
      )}
      style={style}
      {...props}
    >
      <div className="col-span-full grid grid-cols-subgrid">
        {week.days.map((day) => (
          <MonthViewDay
            key={day.toString()}
            date={day}
            overflowRef={overflowRef}
          >
            <MonthViewDayOverflow items={overflowItems} date={day} />
          </MonthViewDay>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-7.5 bottom-0 grid min-w-0 auto-rows-max grid-cols-(--month-view-grid)">
        {lanes
          .slice(0, capacity)
          .map((lane, y) =>
            lane.map((item) => (
              <MonthViewItem
                key={item.id}
                item={item}
                range={week}
                layout={{ y }}
              />
            )),
          )}
      </div>
    </div>
  );
}
