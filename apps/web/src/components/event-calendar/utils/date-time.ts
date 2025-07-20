/**
 * Date and Time Utilities
 *
 * This file contains utility functions for:
 * - Date navigation (previous/next periods based on calendar view)
 * - Date/time manipulation
 * - Weekend detection and filtering
 * - Miscellaneous helpers
 */

import { format, getDay } from "date-fns";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";
import {
  eachDayOfInterval,
  endOfWeek,
  isSameMonth,
  isWeekend,
  startOfWeek,
} from "@repo/temporal/v2";

import { AgendaDaysToShow, TIME_INTERVALS } from "../constants";
import { CalendarView } from "../types";

export function snapTimeToInterval(time: Date): Date {
  const snappedTime = new Date(time);
  const minutes = snappedTime.getMinutes();
  const remainder = minutes % TIME_INTERVALS.SNAP_TO_MINUTES;

  if (remainder !== 0) {
    if (remainder < TIME_INTERVALS.SNAP_THRESHOLD) {
      snappedTime.setMinutes(minutes - remainder);
    } else {
      snappedTime.setMinutes(
        minutes + (TIME_INTERVALS.SNAP_TO_MINUTES - remainder),
      );
    }
    snappedTime.setSeconds(0);
    snappedTime.setMilliseconds(0);
  }

  return snappedTime;
}

export function navigateToPrevious(
  currentDate: Temporal.PlainDate,
  view: CalendarView,
): Temporal.PlainDate {
  switch (view) {
    case "month":
      return currentDate.subtract({ months: 1 });
    case "week":
      return currentDate.subtract({ weeks: 1 });
    case "day":
      return currentDate.subtract({ days: 1 });
    case "agenda":
      return currentDate.subtract({ days: AgendaDaysToShow });
    default:
      return currentDate;
  }
}

export function navigateToNext(
  currentDate: Temporal.PlainDate,
  view: CalendarView,
): Temporal.PlainDate {
  switch (view) {
    case "month":
      return currentDate.add({ months: 1 });
    case "week":
      return currentDate.add({ weeks: 1 });
    case "day":
      return currentDate.add({ days: 1 });
    case "agenda":
      return currentDate.add({ days: AgendaDaysToShow });
    default:
      return currentDate;
  }
}

export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function getMonthTitle(date: Temporal.PlainDate, timeZone: string) {
  const value = toDate({ value: date, timeZone });
  return {
    full: format(value, "MMMM yyyy"),
    medium: "",
    short: format(value, "MMM yyyy"),
  };
}

interface GetWeekTitleOptions {
  timeZone: string;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function getWeekTitle(
  date: Temporal.PlainDate,
  options: GetWeekTitleOptions,
) {
  const start = startOfWeek(date, {
    weekStartsOn: options.weekStartsOn,
  });
  const end = endOfWeek(date, { weekStartsOn: options.weekStartsOn });

  if (isSameMonth(start, end)) {
    return getMonthTitle(start, options.timeZone);
  }

  const startValue = toDate({ value: start, timeZone: options.timeZone });
  const endValue = toDate({ value: end, timeZone: options.timeZone });

  return {
    full: `${format(startValue, "MMM")} - ${format(endValue, "MMM yyyy")}`,
    medium: "",
    short: `${format(startValue, "MMM")} - ${format(endValue, "MMM")}`,
  };
}

export function getDayTitle(date: Temporal.PlainDate, timeZone: string) {
  const value = toDate({ value: date, timeZone });

  return {
    full: format(value, "EEE MMMM d, yyyy"),
    medium: format(value, "MMMM d, yyyy"),
    short: format(value, "MMM d, yyyy"),
  };
}

export function getAgendaTitle(date: Temporal.PlainDate, timeZone: string) {
  const start = date;
  const end = date.add({ days: AgendaDaysToShow - 1 });

  if (isSameMonth(start, end)) {
    return getMonthTitle(start, timeZone);
  }

  const startValue = toDate({ value: start, timeZone });
  const endValue = toDate({ value: end, timeZone });

  return {
    full: `${format(startValue, "MMM")} - ${format(endValue, "MMM yyyy")}`,
    medium: "",
    short: `${format(startValue, "MMM")} - ${format(endValue, "MMM")}`,
  };
}

interface GetViewTitleDataOptions {
  view: CalendarView;
  timeZone: string;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function getViewTitleData(
  currentDate: Temporal.PlainDate,
  options: GetViewTitleDataOptions,
) {
  switch (options.view) {
    case "month":
      return getMonthTitle(currentDate, options.timeZone);
    case "week":
      return getWeekTitle(currentDate, {
        timeZone: options.timeZone,
        weekStartsOn: options.weekStartsOn,
      });
    case "day":
      return getDayTitle(currentDate, options.timeZone);
    case "agenda":
      return getAgendaTitle(currentDate, options.timeZone);
    default:
      return getMonthTitle(currentDate, options.timeZone);
  }
}

export function filterWeekdays(
  dates: Temporal.PlainDate[],
): Temporal.PlainDate[] {
  return dates.filter((date) => !isWeekend(date));
}

export function isWeekendIndex(dayIndex: number): boolean {
  return dayIndex === 0 || dayIndex === 6;
}

export function getWeek(
  value: Temporal.PlainDate,
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7,
) {
  const weekStart = startOfWeek(value, {
    weekStartsOn,
  });

  const weekEnd = endOfWeek(value, {
    weekStartsOn,
  });

  return {
    start: weekStart,
    end: weekEnd,
    days: eachDayOfInterval(weekStart, weekEnd),
  };
}

export function getWeekDays(value: Temporal.PlainDate): Temporal.PlainDate[] {
  const weekStart = startOfWeek(value, {
    weekStartsOn: 1,
  });

  const weekEnd = endOfWeek(value, {
    weekStartsOn: 1,
  });

  return eachDayOfInterval(weekStart, weekEnd);
}

export function filterDaysByWeekendPreference(
  days: Temporal.PlainDate[],
  showWeekends: boolean,
): Temporal.PlainDate[] {
  return showWeekends ? days : days.filter((day) => !isWeekend(day));
}
