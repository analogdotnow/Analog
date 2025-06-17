import {
  parseTime,
  toCalendarDateTime,
  toZoned,
  type CalendarDate,
} from "@internationalized/date";
import { Temporal } from "temporal-polyfill";

import type { EventOutputData } from "@/lib/schemas/event-form/form";

type DateFields = Pick<
  EventOutputData,
  "startDate" | "endDate" | "startTime" | "endTime" | "timezone"
>;

type StringDateFields = {
  date: CalendarDate;
  time: string | null;
  timezone: string;
};

export function getZonedEventTimes(data: DateFields) {
  try {
    return {
      startTime: getTemporalZonedDateTime({
        date: data.startDate,
        time: data.startTime,
        timezone: data.timezone,
      }),
      endTime: getTemporalZonedDateTime({
        date: data.startDate,
        time: data.endTime,
        timezone: data.timezone,
      }),
    };
  } catch (error) {
    console.error("Error getting zoned event dates:", error);
    return {
      startTime: null,
      endTime: null,
    };
  }
}

export function getTemporalZonedDateTime(
  strings: StringDateFields,
): Temporal.ZonedDateTime {
  const { date, time, timezone } = strings;
  const parsedTime = time ? parseTime(time) : undefined;

  const dateTime = toCalendarDateTime(date, parsedTime);
  const zoned = toZoned(dateTime, timezone);

  return Temporal.ZonedDateTime.from({
    year: zoned.year,
    month: zoned.month,
    day: zoned.day,
    hour: zoned.hour,
    minute: zoned.minute,
    timeZone: zoned.timeZone,
  });
}

const timeFormatter = new Intl.DateTimeFormat("default", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function getFormattedTime(time: Temporal.ZonedDateTime): string {
  return timeFormatter.format(time.toInstant().epochMilliseconds);
}
