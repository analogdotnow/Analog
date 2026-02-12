"use client";

import * as React from "react";

import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { formatTime } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

const END_OF_DAY_MINUTES = 1440; // 24 hours * 60 minutes

export function useTimeIndicatorPosition() {
  const time = useZonedDateTime();
  const defaultTimeZone = useDefaultTimeZone();
  const { use12Hour, locale } = useCalendarStore((s) => s.calendarSettings);
  const columnHeight = useCalendarStore((s) => s.cellHeight * 24);

  return React.useMemo(() => {
    const totalMinutes = time.hour * 60 + time.minute;
    const position = (totalMinutes / END_OF_DAY_MINUTES) * columnHeight;

    const label = formatTime({
      value: time,
      use12Hour,
      locale,
      timeZone: defaultTimeZone,
    });

    return {
      position,
      label,
    };
  }, [use12Hour, time, locale, defaultTimeZone, columnHeight]);
}
