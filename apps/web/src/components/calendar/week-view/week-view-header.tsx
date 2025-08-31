import * as React from "react";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday, isWeekend, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { cn } from "@/lib/utils";

interface WeekViewHeaderProps {
  allDays: Temporal.PlainDate[];
}

export function WeekViewHeader({ allDays }: WeekViewHeaderProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const timeZone = React.useMemo(() => {
    const value = toDate(allDays[0]!, { timeZone: settings.defaultTimeZone });

    const parts = new Intl.DateTimeFormat(settings.locale, {
      timeZoneName: "short",
      timeZone: settings.defaultTimeZone,
    }).formatToParts(value);

    return parts.find((part) => part.type === "timeZoneName")?.value ?? " ";
  }, [allDays, settings.defaultTimeZone, settings.locale]);

  return (
    <div className="grid grid-cols-(--week-view-grid) border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear select-none">
      <div className="flex flex-col items-end justify-end py-2 pe-2 pb-2.5 text-center text-sm text-[10px] font-medium text-muted-foreground/70 sm:pe-4 sm:text-xs">
        <span className="max-[479px]:sr-only">{timeZone}</span>
      </div>
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

  const value = toDate(day, { timeZone: settings.defaultTimeZone });

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
      <span className="truncate sm:hidden" aria-hidden="true">
        {format(value, "E")[0]} {format(value, "d")}
      </span>
      <span className="truncate max-sm:hidden">{format(value, "EEE d")}</span>
    </div>
  );
}
