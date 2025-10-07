import { Temporal } from "temporal-polyfill";

import type { Recurrence } from "../../../interfaces";

function formatTemporal(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
): string {
  if (value instanceof Temporal.PlainDate) {
    return value.toString().replace(/-/g, "");
  } else if (value instanceof Temporal.ZonedDateTime) {
    return value.toInstant().toString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  }

  return value.toString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

export function toRRule(recurrence: Recurrence): string {
  const parts = [
    `FREQ=${recurrence.freq}`,
    recurrence.interval ? `INTERVAL=${recurrence.interval}` : "",
    recurrence.count ? `COUNT=${recurrence.count}` : "",
    recurrence.until ? `UNTIL=${formatTemporal(recurrence.until)}` : "",
    recurrence.byDay
      ? `BYDAY=${recurrence.byDay.map((day) => day).join(",")}`
      : "",
    recurrence.byMonth ? `BYMONTH=${recurrence.byMonth.join(",")}` : "",
    recurrence.byMonthDay
      ? `BYMONTHDAY=${recurrence.byMonthDay.join(",")}`
      : "",
    recurrence.byYearDay ? `BYYEARDAY=${recurrence.byYearDay.join(",")}` : "",
    recurrence.byWeekNo ? `BYWEEKNO=${recurrence.byWeekNo.join(",")}` : "",
    recurrence.byHour ? `BYHOUR=${recurrence.byHour.join(",")}` : "",
    recurrence.byMinute ? `BYMINUTE=${recurrence.byMinute.join(",")}` : "",
    recurrence.bySecond ? `BYSECOND=${recurrence.bySecond.join(",")}` : "",
    recurrence.bySetPos ? `BYSETPOS=${recurrence.bySetPos.join(",")}` : "",
    recurrence.wkst ? `WKST=${recurrence.wkst}` : "",
  ].filter(Boolean);

  return "RRULE:" + parts.join(";");
}

/**
 * Exports RDATE (Recurrence Date) values as an RDATE property string
 * @param rDates - Array of dates to include in the recurrence
 * @returns RDATE property string (e.g., "RDATE:20231225T120000Z,20231226T120000Z")
 */
export function toRDate(
  rDates: (Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant)[],
): string {
  if (!rDates || rDates.length === 0) {
    return "";
  }

  const formattedDates = rDates.map(formatTemporal).join(",");
  return `RDATE:${formattedDates}`;
}

/**
 * Exports EXDATE (Exception Date) values as an EXDATE property string
 * @param exDates - Array of dates to exclude from the recurrence
 * @returns EXDATE property string (e.g., "EXDATE:20231225T120000Z,20231226T120000Z")
 */
export function toExDate(
  exDates: (Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant)[],
): string {
  if (!exDates || exDates.length === 0) {
    return "";
  }

  const formattedDates = exDates.map(formatTemporal).join(",");
  return `EXDATE:${formattedDates}`;
}

/**
 * Exports a complete recurrence specification as an array of iCalendar properties
 * @param recurrence - Recurrence object to export
 * @returns Array of iCalendar property strings (RRULE, RDATE, EXDATE)
 */
export function toRecurrenceProperties(recurrence: Recurrence): string[] {
  const properties: string[] = [];

  // Always include RRULE if we have a frequency
  properties.push(toRRule(recurrence));

  // Add RDATE if present
  if (recurrence.rDate && recurrence.rDate.length > 0) {
    properties.push(toRDate(recurrence.rDate));
  }

  // Add EXDATE if present
  if (recurrence.exDate && recurrence.exDate.length > 0) {
    properties.push(toExDate(recurrence.exDate));
  }

  return properties;
}
