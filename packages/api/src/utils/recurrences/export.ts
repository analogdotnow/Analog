import { Temporal } from "temporal-polyfill";

import { Recurrence } from "../../interfaces/events";

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
  const rule = [
    "RRULE:" +
      [
        `FREQ=${recurrence.frequency.toUpperCase()}`,
        recurrence.interval ? `INTERVAL=${recurrence.interval}` : "",
        recurrence.count ? `COUNT=${recurrence.count}` : "",
        recurrence.until ? `UNTIL=${formatTemporal(recurrence.until)}` : "",
        recurrence.byDay ? `BYDAY=${recurrence.byDay.join(",")}` : "",
        recurrence.byMonth ? `BYMONTH=${recurrence.byMonth.join(",")}` : "",
        recurrence.byMonthDay
          ? `BYMONTHDAY=${recurrence.byMonthDay.join(",")}`
          : "",
        recurrence.byYearDay
          ? `BYYEARDAY=${recurrence.byYearDay.join(",")}`
          : "",
        recurrence.byWeekNo ? `BYWEEKNO=${recurrence.byWeekNo.join(",")}` : "",
        recurrence.byHour ? `BYHOUR=${recurrence.byHour.join(",")}` : "",
        recurrence.byMinute ? `BYMINUTE=${recurrence.byMinute.join(",")}` : "",
        recurrence.bySecond ? `BYSECOND=${recurrence.bySecond.join(",")}` : "",
      ].filter(Boolean),
  ].join(";");

  return rule;
}
