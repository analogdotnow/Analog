"use client";

import React from "react";
import { format } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";
import {
  endOfWeek,
  isSameDay,
  isWithinInterval,
  startOfWeek,
} from "@repo/temporal/v2";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { useZonedDateTime } from "../context/datetime-provider";

const END_OF_DAY_MINUTES = 1440; // 24 hours * 60 minutes

export function useCurrentTimeIndicator(
  currentDate: Temporal.PlainDate,
  view: "day" | "week",
) {
  const time = useZonedDateTime();
  const { defaultTimeZone, weekStartsOn, use12Hour } = useCalendarSettings();

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

      const position = (totalMinutes / END_OF_DAY_MINUTES) * 100;

      let isCurrentTimeVisible = false;

      if (view === "day") {
        isCurrentTimeVisible = isSameDay(time, currentDate, {
          timeZone: defaultTimeZone,
        });
      } else if (view === "week") {
        const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn });
        const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn });

        isCurrentTimeVisible = isWithinInterval(
          time,
          {
            start: startOfWeekDate,
            end: endOfWeekDate,
          },
          { timeZone: defaultTimeZone },
        );
      }

      if (!time) {
        return {
          currentTimePosition: 0,
          currentTimeVisible: false,
          formattedTime: "",
        };
      }
      const formattedTime = use12Hour
        ? format(toDate({ value: time, timeZone: defaultTimeZone }), "h:mm a")
        : format(toDate({ value: time, timeZone: defaultTimeZone }), "HH:mm");

      return {
        currentTimePosition: position,
        currentTimeVisible: isCurrentTimeVisible,
        formattedTime,
      };
    }, [currentDate, view, use12Hour, time, defaultTimeZone, weekStartsOn]);

  return { currentTimePosition, currentTimeVisible, formattedTime };
}
