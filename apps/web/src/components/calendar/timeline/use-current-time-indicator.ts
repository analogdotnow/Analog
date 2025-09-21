"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useZonedDateTime } from "../context/datetime-provider";
import { formatTime } from "@/lib/utils/format";
import { columnHeightAtom } from "@/atoms/cell-height";

const END_OF_DAY_MINUTES = 1440; // 24 hours * 60 minutes

interface UseCurrentTimeIndicatorProps {
  date: Temporal.PlainDate;
}

export function useCurrentTimeIndicator({
  date,
}: UseCurrentTimeIndicatorProps) {
  const time = useZonedDateTime();
  const { defaultTimeZone, use12Hour } = useAtomValue(calendarSettingsAtom);
  const columnHeight = useAtomValue(columnHeightAtom);

  return React.useMemo(() => {
    const totalMinutes = time.hour * 60 + time.minute;
    const position = (totalMinutes / END_OF_DAY_MINUTES) * columnHeight;
    const visible = isToday(date, {
      timeZone: defaultTimeZone,
    });

    const label = formatTime({
      value: time,
      use12Hour,
      timeZone: defaultTimeZone,
    });

    return {
      position,
      visible,
      label,
    };
  }, [date, use12Hour, time, defaultTimeZone, columnHeight]);
}
