/**
 * Date and Time Utilities
 *
 * This file contains utility functions for:
 * - Date navigation (previous/next periods based on calendar view)
 * - Date/time manipulation
 * - Weekend detection and filtering
 * - Miscellaneous helpers
 */

import { Temporal } from "temporal-polyfill";

import { eachDayOfInterval, endOfWeek, startOfWeek } from "@repo/temporal";

import { AGENDA_DAYS_TO_DISPLAY } from "@/components/calendar/constants";
import { CalendarView } from "@/components/calendar/interfaces";

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
      return currentDate.subtract({ days: AGENDA_DAYS_TO_DISPLAY });
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
      return currentDate.add({ days: AGENDA_DAYS_TO_DISPLAY });
    default:
      return currentDate;
  }
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
