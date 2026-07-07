"use client";

import * as React from "react";
import { format } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal";

import { cn } from "@/lib/utils";
import { useDefaultTimeZone } from "@/store/hooks";
import type { DerivedWeekDay } from "./infinite-week-view-day-provider";

interface InfiniteWeekViewHeaderProps {
  items: readonly DerivedWeekDay[];
}

export function InfiniteWeekViewHeader({ items }: InfiniteWeekViewHeaderProps) {
  "use memo";

  return (
    <div className="relative h-9 w-(--week-view-width) flex-1 select-none">
      {items.map(({ date, index }) => (
        <InfiniteWeekViewHeaderDay
          key={date.toString()}
          className="absolute top-0 left-(--column-offset) w-(--column-width) [--column-offset:calc((var(--day-offset)-var(--track-base))*var(--column-width))]"
          day={date}
          style={{ "--day-offset": index }}
        />
      ))}
    </div>
  );
}

interface InfiniteWeekViewHeaderDayProps extends React.ComponentProps<"div"> {
  day: Temporal.PlainDate;
}

function InfiniteWeekViewHeaderDay({
  className,
  day,
  ...props
}: InfiniteWeekViewHeaderDayProps) {
  "use memo";

  const defaultTimeZone = useDefaultTimeZone();

  return (
    <div
      className={cn(
        "overflow-hidden text-center text-base font-medium text-muted-foreground/70",
        isToday(day, { timeZone: defaultTimeZone }) && "text-foreground",
        className,
      )}
      {...props}
    >
      <span
        className="truncate text-xs @xs/calendar-view:text-sm @md/calendar-view:hidden"
        aria-hidden
      >
        {format(day.toString(), "d")[0]} {format(day.toString(), "D")}
      </span>
      <span className="truncate text-sm @max-md/calendar-view:hidden @lg/calendar-view:text-base">
        {format(day.toString(), "ddd D")}
      </span>
    </div>
  );
}
