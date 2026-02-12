import { tzDate } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { TemporalConvertible } from "./interfaces";

interface ToDateOptions {
  timeZone: string;
}

export function toDate(
  value: Temporal.ZonedDateTime,
  options?: ToDateOptions,
): Date;
export function toDate(value: Temporal.Instant, options: ToDateOptions): Date;
export function toDate(value: Temporal.PlainDate, options: ToDateOptions): Date;
export function toDate(
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate,
  options: ToDateOptions,
): Date;
export function toDate(
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate,
  options?: ToDateOptions,
): Date {
  if (value instanceof Temporal.PlainDate) {
    return tzDate(
      new Date(value.year, value.month - 1, value.day, 0, 0, 0, 0),
      options!.timeZone,
    );
  }

  if (value instanceof Temporal.Instant) {
    return tzDate(new Date(value.epochMilliseconds), options!.timeZone);
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
    options?.timeZone ?? value.timeZoneId,
  );
}

interface ToInstantOptions {
  timeZone: string;
}

export function toInstant(date: Temporal.Instant): Temporal.Instant;
export function toInstant(date: Temporal.ZonedDateTime): Temporal.Instant;
export function toInstant(
  date: Temporal.PlainDate,
  options: ToInstantOptions,
): Temporal.Instant;
export function toInstant(
  date: TemporalConvertible,
  options?: ToInstantOptions,
): Temporal.Instant;

export function toInstant(
  date: TemporalConvertible,
  options?: ToInstantOptions,
): Temporal.Instant {
  if (date instanceof Temporal.Instant) {
    return date;
  }

  if (date instanceof Temporal.ZonedDateTime) {
    return date.toInstant();
  }

  if (!options) {
    throw new Error("options with timeZone required for PlainDate");
  }

  // PlainDate - convert to start of day in the specified timezone
  return date.toZonedDateTime(options.timeZone).toInstant();
}

interface ToPlainDateOptions {
  timeZone: string;
}

export function toPlainDate(date: Temporal.PlainDate): Temporal.PlainDate;
export function toPlainDate(date: Temporal.ZonedDateTime): Temporal.PlainDate;
export function toPlainDate(
  date: Temporal.Instant,
  options: ToPlainDateOptions,
): Temporal.PlainDate;
export function toPlainDate(
  date: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: ToPlainDateOptions,
): Temporal.PlainDate;
export function toPlainDate(
  date: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options?: ToPlainDateOptions,
): Temporal.PlainDate {
  if (date instanceof Temporal.PlainDate) {
    return date;
  }

  if (date instanceof Temporal.ZonedDateTime) {
    if (options?.timeZone) {
      return date.withTimeZone(options.timeZone).toPlainDate();
    }

    return date.toPlainDate();
  }

  return date.toZonedDateTimeISO(options!.timeZone).toPlainDate();
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

interface ToPlainYearMonthOptions {
  timeZone: string;
}

export function toPlainYearMonth(
  v: Temporal.PlainYearMonth,
): Temporal.PlainYearMonth;
export function toPlainYearMonth(
  v: Temporal.PlainDate,
): Temporal.PlainYearMonth;
export function toPlainYearMonth(
  v: Temporal.ZonedDateTime,
): Temporal.PlainYearMonth;
export function toPlainYearMonth(
  v: Temporal.Instant,
  options: ToPlainYearMonthOptions,
): Temporal.PlainYearMonth;
export function toPlainYearMonth(
  v:
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | Temporal.PlainYearMonth,
  options?: ToPlainYearMonthOptions,
): Temporal.PlainYearMonth;

export function toPlainYearMonth(
  v:
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | Temporal.PlainYearMonth,
  options?: ToPlainYearMonthOptions,
): Temporal.PlainYearMonth {
  if (v instanceof Temporal.PlainYearMonth) {
    return v;
  }

  if (v instanceof Temporal.Instant) {
    if (!options) {
      throw new Error(
        "options with timeZone required when converting Instant types",
      );
    }

    return toPlainDate(v, options).toPlainYearMonth();
  }

  if (v instanceof Temporal.ZonedDateTime) {
    return v.toPlainDate().toPlainYearMonth();
  }

  return v.toPlainYearMonth();
}
