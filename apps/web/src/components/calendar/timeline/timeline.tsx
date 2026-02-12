"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone, useTimeZoneList } from "@/store/hooks";
import { HOURS } from "./constants";

export function Timeline() {
  "use memo";

  const timeZones = useTimeZoneList();

  return (
    <div
      className={cn(
        "grid grid-cols-[repeat(auto-fill,3rem)] grid-rows-1 select-none sm:grid-cols-[repeat(auto-fill,4rem)]",
        timeZones.length > 1 &&
          "grid-cols-[3rem_repeat(auto-fill,2.5rem)] sm:grid-cols-[4rem_repeat(auto-fill,3rem)]",
      )}
    >
      {timeZones.map((timeZone) => (
        <TimelineColumn key={timeZone.id} timeZone={timeZone.id} />
      ))}
    </div>
  );
}

export const MemoizedTimeline = React.memo(Timeline);

function useHours(timeZone: string) {
  const use12Hour = useCalendarStore((s) => s.calendarSettings.use12Hour);
  const defaultTimeZone = useDefaultTimeZone();

  return React.useMemo(() => {
    // TODO: do we need the current date here?
    const date = Temporal.Now.plainDateISO();

    const start = startOfDay(date, { timeZone: defaultTimeZone });

    const hours = HOURS.map((time) => {
      return start.add({ hours: time.hour }).withTimeZone(timeZone);
    });

    return hours.map((hour) => ({
      label: formatTime({
        value: hour,
        use12Hour,
        timeZone,
      }),
      value: hour,
    }));
  }, [timeZone, use12Hour, defaultTimeZone]);
}

interface TimelineColumnProps {
  timeZone: string;
}

function TimelineColumn({ timeZone }: TimelineColumnProps) {
  "use memo";

  const hours = useHours(timeZone);

  return (
    <div className="grid auto-cols-fr select-none">
      {hours.map((hour, index) => (
        <div
          key={index}
          className="relative min-h-(--week-cells-height) border-b border-transparent last:border-b-0"
        >
          {index > 0 ? (
            <span className="absolute -top-3 left-0 flex h-6 w-20 max-w-full items-center justify-end bg-background/0 pe-2 text-3xs font-medium text-muted-foreground/70 tabular-nums sm:pe-4 sm:text-xs">
              {hour.label}
            </span>
          ) : null}
        </div>
      ))}
      <div className="pointer-events-none h-(--week-view-bottom-padding)" />
    </div>
  );
}
