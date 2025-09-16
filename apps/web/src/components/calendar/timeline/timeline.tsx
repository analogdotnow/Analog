import * as React from "react";
import { format } from "@formkit/tempo";
import { getTimeZones } from "@vvo/tzdb";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { startOfDay, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { timeZonesAtom } from "@/atoms/timezones";
import { currentDateAtom } from "@/atoms/view-preferences";
import { range } from "@/lib/utils";

export function TimelineHeader() {
  const timeZones = useAtomValue(timeZonesAtom);

  return (
    <div className="grid grid-flow-col grid-cols-[3rem_repeat(auto-fill,_2.5rem)] items-end justify-end py-2 pb-2.5 text-center text-sm text-[10px] font-medium text-muted-foreground/70 sm:grid-cols-[4rem_repeat(auto-fill,_3rem)] sm:text-xs">
      {timeZones.map((timeZone) => (
        <TimelineHeaderItem key={timeZone.id} timeZone={timeZone.id} />
      ))}
    </div>
  );
}

interface TimelineHeaderItemProps {
  timeZone: string;
}

function getLabel(timeZoneId: string) {
  const timeZone = getTimeZones().find((tz) => tz.name === timeZoneId);

  return timeZone?.abbreviation;
}

function TimelineHeaderItem({ timeZone }: TimelineHeaderItemProps) {
  const currentDate = useAtomValue(currentDateAtom);
  const settings = useAtomValue(calendarSettingsAtom);

  const label = React.useMemo(() => {
    const abbreviation = getLabel(timeZone);

    if (abbreviation) {
      return abbreviation;
    }

    const start = startOfDay(currentDate, { timeZone });
    const value = toDate(start, { timeZone });

    const parts = new Intl.DateTimeFormat(settings.locale, {
      timeZoneName: "short",
      timeZone,
    }).formatToParts(value);

    return parts.find((part) => part.type === "timeZoneName")?.value ?? " ";
  }, [currentDate, settings.locale, timeZone]);

  return (
    <div className="mask-r-from-75% mask-r-to-90% pe-0 first:mask-r-from-85% first:mask-r-to-90% max-[479px]:sr-only sm:pe-2">
      <div className="min-w-full pe-2 text-end">{label}</div>
    </div>
  );
}
export function TimelineContainer() {
  const timeZones = useAtomValue(timeZonesAtom);
  const currentDate = useAtomValue(currentDateAtom);

  return (
    <div className="grid grid-flow-col grid-cols-[3rem_repeat(auto-fill,_2.5rem)] grid-rows-1 border-r border-border/70 select-none sm:grid-cols-[4rem_repeat(auto-fill,_3rem)]">
      {timeZones.map((timeZone) => (
        <Timeline
          key={timeZone.id}
          currentDate={currentDate}
          timeZone={timeZone.id}
        />
      ))}
    </div>
  );
}

const HOURS = range(0, 23)
  .map((hour) => Temporal.PlainTime.from({ hour }))

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
      label: format({
        date: toDate(hour),
        format: use12Hour ? "h:mm a" : "HH:mm",
        tz: timeZone,
      }),
      value: hour,
    }));
  }, [currentDate, timeZone, use12Hour, defaultTimeZone]);
}

interface TimelineProps {
  currentDate: Temporal.PlainDate;
  timeZone: string;
}

export function Timeline({ currentDate, timeZone }: TimelineProps) {
  const hours = useHours(currentDate, timeZone);

  return (
    <div className="grid auto-cols-fr select-none">
      {hours.map((hour, index) => (
        <div
          key={index}
          className="relative min-h-[var(--week-cells-height)] border-b border-transparent last:border-b-0"
        >
          {index > 0 ? (
            <span className="absolute -top-3 left-0 flex h-6 w-20 max-w-full items-center justify-end bg-background/0 pe-2 text-[10px] font-medium text-muted-foreground/70 tabular-nums sm:pe-4 sm:text-xs">
              {hour.label}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export const MemoizedTimeline = React.memo(Timeline);