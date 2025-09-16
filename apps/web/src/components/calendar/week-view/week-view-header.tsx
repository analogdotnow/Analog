"use client";

import * as React from "react";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday, isWeekend, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { cn } from "@/lib/utils";
import { TimelineHeader } from "../timeline/timeline-header";

interface WeekViewHeaderProps {
  allDays: Temporal.PlainDate[];
}

export function WeekViewHeader({ allDays }: WeekViewHeaderProps) {
  return (
    <div className="grid grid-cols-(--week-view-grid) border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear select-none">
      <TimelineHeader />
      {allDays.map((day) => (
        <WeekViewHeaderDay key={day.toString()} day={day} />
      ))}
    </div>
  );
}

interface WeekViewHeaderDayProps {
  day: Temporal.PlainDate;
}

function WeekViewHeaderDay({ day }: WeekViewHeaderDayProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const settings = useAtomValue(calendarSettingsAtom);

  const isDayVisible = viewPreferences.showWeekends || !isWeekend(day);

  const value = React.useMemo(
    () => toDate(day, { timeZone: settings.defaultTimeZone }),
    [day, settings.defaultTimeZone],
  );

  return (
    <div
      key={day.toString()}
      className={cn(
        "overflow-hidden py-2 text-center text-base font-medium text-muted-foreground/70 data-today:text-foreground",
        isDayVisible ? "visible" : "hidden w-0",
      )}
      data-today={
        isToday(day, { timeZone: settings.defaultTimeZone }) || undefined
      }
    >
      <span
        className="truncate text-xs @xs/calendar-view:text-sm @md/calendar-view:hidden"
        aria-hidden="true"
      >
        {format(value, "E")[0]} {format(value, "d")}
      </span>
      <span className="truncate text-sm @max-md/calendar-view:hidden @lg/calendar-view:text-base">
        {format(value, "EEE d")}
      </span>
    </div>
  );
}
