import { Temporal } from "temporal-polyfill";

import type { Recurrence } from "../../interfaces";

function formatTemporal(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
) {
  if (value instanceof Temporal.PlainDate) {
    const date = value.toString().replace(/-/g, "");

    return `;VALUE=DATE:${date}`;
  }

  if (value instanceof Temporal.ZonedDateTime) {
    const dateTime = value
      .toString({
        smallestUnit: "second",
        fractionalSecondDigits: 0,
        timeZoneName: "never",
        offset: "never",
      })
      .replace(/[-:]/g, "");
    return `;TZID=${value.timeZoneId}:${dateTime}`;
  }

  const dateTime = value
    .toZonedDateTimeISO("UTC")
    .toString({
      smallestUnit: "second",
      fractionalSecondDigits: 0,
      timeZoneName: "never",
      offset: "never",
    })
    .replace(/[-:]/g, "");

  return `:${dateTime}Z`;
}

function formatUntil(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
): string {
  if (value instanceof Temporal.PlainDate) {
    return value.toString().replace(/-/g, "");
  }

  if (value instanceof Temporal.ZonedDateTime) {
    const dateTime = value
      .withTimeZone("UTC")
      .toString({
        smallestUnit: "second",
        fractionalSecondDigits: 0,
        timeZoneName: "never",
        offset: "never",
      })
      .replace(/[-:]/g, "");
    return `${dateTime}Z`;
  }

  const dateTime = value
    .toZonedDateTimeISO("UTC")
    .toString({
      smallestUnit: "second",
      fractionalSecondDigits: 0,
      timeZoneName: "never",
      offset: "never",
    })
    .replace(/[-:]/g, "");
  return `${dateTime}Z`;
}

export function toRRule(recurrence: Recurrence): string {
  const parts = [
    recurrence.rscale ? `RSCALE=${recurrence.rscale}` : "",
    recurrence.skip ? `SKIP=${recurrence.skip}` : "",
    `FREQ=${recurrence.freq}`,
    recurrence.interval ? `INTERVAL=${recurrence.interval}` : "",
    recurrence.count ? `COUNT=${recurrence.count}` : "",
    recurrence.until ? `UNTIL=${formatUntil(recurrence.until)}` : "",
    recurrence.byDay ? `BYDAY=${recurrence.byDay.join(",")}` : "",
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

  return `RRULE:${parts.join(";")}`;
}

interface ToRDateOptions {
  rDates: (Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant)[];
}

export function toRDate({ rDates }: ToRDateOptions) {
  return rDates.map((value) => `RDATE${formatTemporal(value)}`);
}

interface ToExDateOptions {
  exDates: (Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant)[];
}

function toExDate({ exDates }: ToExDateOptions) {
  return exDates.map((value) => `EXDATE${formatTemporal(value)}`);
}

interface ToDtStartOptions {
  dtstart: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant;
}

function toDtstart({ dtstart }: ToDtStartOptions) {
  return `DTSTART${formatTemporal(dtstart)}`;
}

export function toRecurrenceProperties(recurrence: Recurrence) {
  const properties: string[] = [];

  if (recurrence.dtstart) {
    properties.push(toDtstart({ dtstart: recurrence.dtstart }));
  }

  if (recurrence.freq) {
    properties.push(toRRule(recurrence));
  }

  if (recurrence.rDate && recurrence.rDate.length > 0) {
    properties.push(...toRDate({ rDates: recurrence.rDate }));
  }

  if (recurrence.exDate && recurrence.exDate.length > 0) {
    properties.push(...toExDate({ exDates: recurrence.exDate }));
  }

  return properties;
}
