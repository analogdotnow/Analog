import { Temporal } from "temporal-polyfill";

interface ToDateOptions {
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function toDate({ value, timeZone }: ToDateOptions): Date {
  return new Date(toInstant({ value, timeZone }).toString());
}

interface ToInstantOptions {
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function toInstant({ value, timeZone }: ToInstantOptions) {
  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO(timeZone).toInstant();
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return value.withTimeZone(timeZone).toInstant();
  }

  return value.toZonedDateTime(timeZone).toInstant();
}

interface ToPlainDateOptions {
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function toPlainDate({ value, timeZone }: ToPlainDateOptions) {
  if (value instanceof Temporal.PlainDate) {
    return value;
  }

  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO(timeZone).toPlainDate();
  }

  return value.withTimeZone(timeZone).toPlainDate();
}

export interface IsSameDayOptions {
  a: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  b: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function isSameDay({ a, b, timeZone }: IsSameDayOptions) {
  return toPlainDate({ value: a, timeZone }).equals(
    toPlainDate({ value: b, timeZone }),
  );
}

export interface ToPlainYearMonthOptions {
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function toPlainYearMonth({ value, timeZone }: ToPlainYearMonthOptions) {
  if (value instanceof Temporal.PlainDate) {
    return value.toPlainYearMonth();
  }
  return toPlainDate({ value, timeZone }).toPlainYearMonth();
}

export interface IsSameMonthOptions {
  a: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  b: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function isSameMonth({ a, b, timeZone }: IsSameMonthOptions) {
  return toPlainYearMonth({ value: a, timeZone }).equals(
    toPlainYearMonth({ value: b, timeZone }),
  );
}

export interface IsSameYearOptions {
  a: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  b: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function isSameYear({ a, b, timeZone }: IsSameYearOptions) {
  const yearA = toPlainDate({ value: a, timeZone }).withCalendar(
    "iso8601",
  ).year;
  const yearB = toPlainDate({ value: b, timeZone }).withCalendar(
    "iso8601",
  ).year;

  return yearA === yearB;
}
