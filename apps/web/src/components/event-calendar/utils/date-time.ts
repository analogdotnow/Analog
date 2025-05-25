/**
 * Date and Time Utilities
 *
 * This file contains utility functions for:
 * - Date navigation (previous/next periods based on calendar view)
 * - Date / time manipulation
 * - Miscellaneous helpers
 */

import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { CalendarView } from "../types";
import { AgendaDaysToShow } from "../constants";
import { TIME_INTERVALS, CALENDAR_CONFIG } from "../calendar-constants";

export function snapTimeToInterval(time: Date): Date {
  const snappedTime = new Date(time);
  const minutes = snappedTime.getMinutes();
  const remainder = minutes % TIME_INTERVALS.SNAP_TO_MINUTES;

  if (remainder !== 0) {
    if (remainder < TIME_INTERVALS.SNAP_THRESHOLD) {
      // Round down to nearest interval
      snappedTime.setMinutes(minutes - remainder);
    } else {
      // Round up to nearest interval
      snappedTime.setMinutes(
        minutes + (TIME_INTERVALS.SNAP_TO_MINUTES - remainder)
      );
    }
    snappedTime.setSeconds(0);
    snappedTime.setMilliseconds(0);
  }

  return snappedTime;
}

export function navigateToPrevious(
  currentDate: Date,
  view: CalendarView
): Date {
  switch (view) {
    case "month":
      return subMonths(currentDate, 1);
    case "week":
      return subWeeks(currentDate, 1);
    case "day":
      return addDays(currentDate, -1);
    case "agenda":
      return addDays(currentDate, -AgendaDaysToShow);
    default:
      return currentDate;
  }
}

export function navigateToNext(currentDate: Date, view: CalendarView): Date {
  switch (view) {
    case "month":
      return addMonths(currentDate, 1);
    case "week":
      return addWeeks(currentDate, 1);
    case "day":
      return addDays(currentDate, 1);
    case "agenda":
      return addDays(currentDate, AgendaDaysToShow);
    default:
      return currentDate;
  }
}

export function addHoursToDate(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Generates view title data for different calendar views
 * Returns an object with different formats for responsive design
 */
export function getViewTitleData(currentDate: Date, view: CalendarView) {
  switch (view) {
    case "month":
      return {
        full: format(currentDate, "MMMM yyyy"),
        short: format(currentDate, "MMM yyyy"),
      };

    case "week": {
      const start = startOfWeek(currentDate, {
        weekStartsOn: CALENDAR_CONFIG.WEEK_STARTS_ON,
      });
      const end = endOfWeek(currentDate, {
        weekStartsOn: CALENDAR_CONFIG.WEEK_STARTS_ON,
      });

      if (isSameMonth(start, end)) {
        return {
          full: format(start, "MMMM yyyy"),
          short: format(start, "MMM yyyy"),
        };
      } else {
        return {
          full: `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`,
          short: `${format(start, "MMM")} - ${format(end, "MMM")}`,
        };
      }
    }

    case "day":
      return {
        full: format(currentDate, "EEE MMMM d, yyyy"),
        medium: format(currentDate, "MMMM d, yyyy"),
        short: format(currentDate, "MMM d, yyyy"),
      };

    case "agenda": {
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return {
          full: format(start, "MMMM yyyy"),
          short: format(start, "MMM yyyy"),
        };
      } else {
        return {
          full: `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`,
          short: `${format(start, "MMM")} - ${format(end, "MMM")}`,
        };
      }
    }

    default:
      return {
        full: format(currentDate, "MMMM yyyy"),
        short: format(currentDate, "MMM yyyy"),
      };
  }
}
