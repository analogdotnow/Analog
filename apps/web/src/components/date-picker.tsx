"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { TemporalCalendar } from "@/components/ui/temporal-calendar";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDisplayedDays } from "@/store/hooks";

export function DatePicker() {
  "use memo";

  const currentDate = useCalendarStore((s) => s.currentDate);

  const displayedDays = useDisplayedDays();

  const displayedMonth = React.useMemo(() => {
    return Temporal.PlainYearMonth.from({
      year: currentDate.year,
      month: currentDate.month,
    });
  }, [currentDate.year, currentDate.month]);

  const calendarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!calendarRef.current) {
      return;
    }

    calendarRef.current.style.cssText = "";

    for (let i = 0; i < displayedDays; i++) {
      const day = currentDate.add({ days: i + 1 });
      const isFirst = i === 0;
      const isLast = i === displayedDays - 1;

      calendarRef.current.style.setProperty(
        `--background-day-${day.toString()}`,
        "var(--accent-light)",
      );

      if (isFirst && isLast) {
        calendarRef.current.style.setProperty(
          `--radius-day-${day.toString()}`,
          "var(--radius-sm)",
        );
      } else if (isFirst) {
        calendarRef.current.style.setProperty(
          `--radius-day-${day.toString()}`,
          "var(--radius-sm) 0 0 var(--radius-sm)",
        );
      } else if (isLast) {
        calendarRef.current.style.setProperty(
          `--radius-day-${day.toString()}`,
          "0 var(--radius-sm) var(--radius-sm) 0",
        );
      }
    }
  }, [currentDate, displayedDays]);

  return (
    <TemporalCalendar
      ref={calendarRef}
      defaultMonth={displayedMonth}
      className="w-fit px-0"
    />
  );
}
