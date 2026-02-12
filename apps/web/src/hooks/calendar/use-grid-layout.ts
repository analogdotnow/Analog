import * as React from "react";

import { isWeekend } from "@repo/temporal";

import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useWeekDays } from "./use-week-days";

export function useMonthViewGridLayout() {
  "use memo";

  const showWeekends = useCalendarStore((s) => s.viewPreferences.showWeekends);
  const days = useWeekDays();

  return React.useMemo(() => {
    const columnSizes = days.map((day) => {
      return showWeekends || !isWeekend(day) ? "minmax(0,1fr)" : "0fr";
    });

    return columnSizes.join(" ");
  }, [days, showWeekends]);
}
