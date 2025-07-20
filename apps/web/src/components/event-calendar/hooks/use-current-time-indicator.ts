"use client";

import React from "react";
import { format } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";
import { isToday } from "@repo/temporal/v2";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { useZonedDateTime } from "../context/datetime-provider";

const END_OF_DAY_MINUTES = 1440; // 24 hours * 60 minutes

export function useCurrentTimeIndicator(currentDate: Temporal.PlainDate) {
  const time = useZonedDateTime();
  const { defaultTimeZone, use12Hour } = useCalendarSettings();

  const { currentTimePosition, currentTimeVisible, formattedTime } =
    React.useMemo(() => {
      if (!time) {
        return {
          currentTimePosition: 0,
          currentTimeVisible: false,
          formattedTime: "",
        };
      }

      const totalMinutes = time.hour * 60 + time.minute;
      const currentTimePosition = (totalMinutes / END_OF_DAY_MINUTES) * 100;
      const currentTimeVisible = isToday(currentDate, {
        timeZone: defaultTimeZone,
      });

      const formattedTime = use12Hour
        ? format({
            date: toDate({ value: time, timeZone: defaultTimeZone }),
            format: "h:mm a",
            tz: defaultTimeZone,
          })
        : format({
            date: toDate({ value: time, timeZone: defaultTimeZone }),
            format: "HH:mm",
            tz: defaultTimeZone,
          });

      return {
        currentTimePosition,
        currentTimeVisible,
        formattedTime,
      };
    }, [currentDate, use12Hour, time, defaultTimeZone]);

  return { currentTimePosition, currentTimeVisible, formattedTime };
}
