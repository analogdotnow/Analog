import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { startOfDay } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { timeZonesAtom } from "@/atoms/timezones";
import { currentDateAtom } from "@/atoms/view-preferences";
import { range } from "@/lib/utils";
import { formatTime } from "@/lib/utils/format";

export function Timeline() {
  const timeZones = useAtomValue(timeZonesAtom);
  const currentDate = useAtomValue(currentDateAtom);

  return (
    <div className="grid grid-flow-col grid-cols-[3rem_repeat(auto-fill,_2.5rem)] grid-rows-1 border-r border-border/70 select-none sm:grid-cols-[4rem_repeat(auto-fill,_3rem)]">
      {timeZones.map((timeZone) => (
        <TimelineColumn
          key={timeZone.id}
          currentDate={currentDate}
          timeZone={timeZone.id}
        />
      ))}
    </div>
  );
}

const HOURS = range(0, 23).map((hour) => Temporal.PlainTime.from({ hour }));

export function useHours(currentDate: Temporal.PlainDate, timeZone: string) {
  const { use12Hour, defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  return React.useMemo(() => {
    const start = startOfDay(currentDate, { timeZone: defaultTimeZone });

    let day = start;
    const hours = HOURS.map((time) => {
      if (time.hour === 0) {
        day = day.add({ days: 1 });
      }

      return day.add({ hours: time.hour }).withTimeZone(timeZone);
    });

    return hours.map((hour) => ({
      label: formatTime({
        value: hour,
        use12Hour,
        timeZone,
      }),
      value: hour,
    }));
  }, [currentDate, timeZone, use12Hour, defaultTimeZone]);
}

interface TimelineColumnProps {
  currentDate: Temporal.PlainDate;
  timeZone: string;
}

export function TimelineColumn({ currentDate, timeZone }: TimelineColumnProps) {
  const hours = useHours(currentDate, timeZone);

  return (
    <div className="grid auto-cols-fr select-none">
      {hours.map((hour, index) => (
        <div
          key={index}
          className="relative min-h-(--week-cells-height) border-b border-transparent last:border-b-0"
        >
          {index > 0 ? (
            <span className="absolute -top-3 left-0 flex h-6 w-20 max-w-full items-center justify-end bg-background/0 pe-2 text-[10px] font-medium text-muted-foreground/70 tabular-nums sm:pe-4 sm:text-xs">
              {hour.label}
            </span>
          ) : null}
        </div>
      ))}
      <div className="pointer-events-none h-(--week-view-bottom-padding)" />
    </div>
  );
}

export const MemoizedTimeline = React.memo(TimelineColumn);
