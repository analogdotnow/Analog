import { tzDate } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { TemporalConvertible } from "./interfaces";

interface ToDateOptions {
  timeZone: string;
}

export function toDate(
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate,
  options: ToDateOptions,
): Date {
  if (value instanceof Temporal.PlainDate) {
    return tzDate(
      new Date(value.toString({ calendarName: "never" })),
      options.timeZone,
    );
  }

  if (value instanceof Temporal.Instant) {
    return tzDate(new Date(value.epochMilliseconds), options.timeZone);
  }

  return tzDate(
    new Date(
      value.year,
      value.month - 1,
      value.day,
      value.hour,
      value.minute,
      value.second,
      value.millisecond,
    ),
    options.timeZone,
  );
}

interface ToInstantOptions {
  timeZone: string;
}

export function toInstant(
  date: TemporalConvertible,
  options: ToInstantOptions,
): Temporal.Instant {
  if (date instanceof Temporal.Instant) {
    return date;
  }

  if (date instanceof Temporal.ZonedDateTime) {
    return date.toInstant();
  }

  // PlainDate - convert to start of day in the specified timezone
  return date.toZonedDateTime(options.timeZone).toInstant();
}

interface ToPlainDateOptions {
  timeZone: string;
}

export function toPlainDate(
  date: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: ToPlainDateOptions,
): Temporal.PlainDate {
  if (date instanceof Temporal.PlainDate) {
    return date;
  }

  if (date instanceof Temporal.ZonedDateTime) {
    return date.withTimeZone(options.timeZone).toPlainDate();
  }

  return date.toZonedDateTimeISO(options.timeZone).toPlainDate();
}

interface ToZonedDateTimeOptions {
  timeZone: string;
}

export function toZonedDateTime(
  date: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate,
  options: ToZonedDateTimeOptions,
): Temporal.ZonedDateTime {
  if (date instanceof Temporal.ZonedDateTime) {
    return date.withTimeZone(options.timeZone);
  }

  if (date instanceof Temporal.PlainDate) {
    return date.toZonedDateTime(options.timeZone);
  }

  return date.toZonedDateTimeISO(options.timeZone);
}

export function toDateWeekStartsOn(
  weekStartsOn: number,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return weekStartsOn === 7 ? 0 : (weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6);
}
