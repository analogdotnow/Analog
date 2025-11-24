"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type MonthViewHeaderProps = React.ComponentProps<"div">;

export function MonthViewHeader(props: MonthViewHeaderProps) {
  const settings = useAtomValue(calendarSettingsAtom);

  const weekDays = React.useMemo(() => {
    return [
      ...WEEKDAYS.slice(settings.weekStartsOn),
      ...WEEKDAYS.slice(0, settings.weekStartsOn),
    ];
  }, [settings.weekStartsOn]);

  return (
    <div
      className="grid grid-cols-(--month-view-grid) justify-items-stretch border-b border-border/70 transition-[grid-template-columns] duration-200 ease-linear"
      {...props}
    >
      {weekDays.map((day) => (
        <MonthViewHeaderDay key={day} day={day} />
      ))}
    </div>
  );
}

interface MonthViewHeaderDayProps {
  day: string;
}

function MonthViewHeaderDay({ day }: MonthViewHeaderDayProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);

  const isWeekend = day === "Sat" || day === "Sun";

  const isDayVisible = viewPreferences.showWeekends || !isWeekend;

  return (
    <div
      key={day}
      className={cn(
        "relative py-2 text-center text-sm text-muted-foreground/70",
        !isDayVisible && "hidden w-0",
      )}
    >
      {day}
    </div>
  );
}
