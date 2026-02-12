"use client";

import * as React from "react";

import { useWeekDays } from "@/hooks/calendar/use-week-days";
import { format } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

export function MonthViewHeader() {
  "use memo";

  const showWeekends = useCalendarStore((s) => s.viewPreferences.showWeekends);
  const weekDays = useWeekDays({ showWeekends });
  const defaultTimeZone = useDefaultTimeZone();

  return (
    <div className="grid grid-cols-(--month-view-grid) justify-items-stretch border-b border-border/70">
      {weekDays.map((day) => (
        <MonthViewHeaderDay key={day.toString()}>
          {format(day, "ddd", defaultTimeZone)}
        </MonthViewHeaderDay>
      ))}
    </div>
  );
}

interface MonthViewHeaderDayProps {
  children: React.ReactNode;
}

function MonthViewHeaderDay({ children }: MonthViewHeaderDayProps) {
  "use memo";

  return (
    <div className="relative py-2 text-center text-sm text-muted-foreground/70">
      {children}
    </div>
  );
}
