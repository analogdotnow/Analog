import * as React from "react";
import { Temporal } from "temporal-polyfill";

import {
  eachDayOfInterval,
  endOfWeek,
  isWeekend,
  startOfWeek,
} from "@repo/temporal";

import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

interface UseWeekDaysOptions {
  showWeekends?: boolean;
}

export function useWeekDays(options?: UseWeekDaysOptions) {
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);
  const defaultTimeZone = useDefaultTimeZone();

  return React.useMemo(() => {
    const now = Temporal.Now.plainDateISO(defaultTimeZone);

    const start = startOfWeek(now, { weekStartsOn });
    const end = endOfWeek(now, { weekStartsOn });

    const days = eachDayOfInterval(start, end);

    if (options?.showWeekends ?? true) {
      return days;
    }

    return days.filter((day) => !isWeekend(day));
  }, [weekStartsOn, options?.showWeekends, defaultTimeZone]);
}
