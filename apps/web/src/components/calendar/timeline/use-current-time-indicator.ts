"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { formatTime } from "@/lib/utils/format";
import { useZonedDateTime } from "../context/datetime-provider";

const END_OF_DAY_MINUTES = 1440; // 24 hours * 60 minutes

interface UseCurrentTimeIndicatorProps {
  date: Temporal.PlainDate;
}

export function useCurrentTimeIndicator({
  date,
}: UseCurrentTimeIndicatorProps) {
  const time = useZonedDateTime();
  const { defaultTimeZone, use12Hour, locale } =
    useAtomValue(calendarSettingsAtom);

  return React.useMemo(() => {
    const totalMinutes = time.hour * 60 + time.minute;
    const position = (totalMinutes / END_OF_DAY_MINUTES) * 100;
    const visible = isToday(date, {
      timeZone: defaultTimeZone,
    });

    const label = formatTime({
      value: time,
      use12Hour,
      locale,
      timeZone: defaultTimeZone,
    });

    return {
      position,
      visible,
      label,
    };
  }, [date, use12Hour, time, locale, defaultTimeZone]);
}
