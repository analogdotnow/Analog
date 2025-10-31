import { Temporal } from "temporal-polyfill";

import { toInstant, toPlainDate } from "./convert";
import { TemporalConvertible } from "./interfaces";
import { startOfWeek } from "./utils";

export function isWeekend(
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
): boolean {
  return date.dayOfWeek > 5;
}

interface IsSameDayOptions {
  timeZone: string;
}

export function isSameDay(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
): boolean;
export function isSameDay(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
): boolean;
export function isSameDay(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: IsSameDayOptions,
): boolean;

export function isSameDay(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options?: IsSameDayOptions,
): boolean {
  // Handle the simple case of two PlainDates
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return Temporal.PlainDate.compare(a, b) === 0;
  }

  // Handle the simple case of two ZonedDateTimes with same timezone
  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime &&
    a.timeZoneId === b.timeZoneId
  ) {
    return Temporal.PlainDate.compare(a.toPlainDate(), b.toPlainDate()) === 0;
  }

  // For mixed types or different timezones, convert to PlainDate using options
  if (!options) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const date1 = toPlainDate(a, options);
  const date2 = toPlainDate(b, options);

  return Temporal.PlainDate.compare(date1, date2) === 0;
}

export function isSameMonth(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
): boolean;
export function isSameMonth(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
): boolean;
export function isSameMonth(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: IsSameDayOptions,
): boolean;

export function isSameMonth(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options?: IsSameDayOptions,
): boolean {
  // Handle the simple case of two PlainDates
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return a.year === b.year && a.month === b.month;
  }

  // Handle the simple case of two ZonedDateTimes with same timezone
  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime &&
    a.timeZoneId === b.timeZoneId
  ) {
    const dateA = a.toPlainDate();
    const dateB = b.toPlainDate();
    return dateA.year === dateB.year && dateA.month === dateB.month;
  }

  // For mixed types or different timezones, convert to PlainDate using options
  if (!options) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const date1 = toPlainDate(a, options);
  const date2 = toPlainDate(b, options);

  return date1.year === date2.year && date1.month === date2.month;
}

interface IsSameWeekOptions extends IsSameDayOptions {
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function isSameWeek(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  options: { weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7 },
): boolean;
export function isSameWeek(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  options: { weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7 },
): boolean;
export function isSameWeek(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: IsSameWeekOptions,
): boolean;

export function isSameWeek(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: { weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7; timeZone?: string },
): boolean {
  // Handle the simple case of two PlainDates
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    const startOfWeekA = startOfWeek(a, { weekStartsOn: options.weekStartsOn });
    const startOfWeekB = startOfWeek(b, { weekStartsOn: options.weekStartsOn });
    return Temporal.PlainDate.compare(startOfWeekA, startOfWeekB) === 0;
  }

  // Handle the simple case of two ZonedDateTimes with same timezone
  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime &&
    a.timeZoneId === b.timeZoneId
  ) {
    const startOfWeekA = startOfWeek(a.toPlainDate(), {
      weekStartsOn: options.weekStartsOn,
    });
    const startOfWeekB = startOfWeek(b.toPlainDate(), {
      weekStartsOn: options.weekStartsOn,
    });
    return Temporal.PlainDate.compare(startOfWeekA, startOfWeekB) === 0;
  }

  // For mixed types or different timezones, convert to PlainDate using options
  if (!options.timeZone) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const date1 = toPlainDate(a, { timeZone: options.timeZone });
  const date2 = toPlainDate(b, { timeZone: options.timeZone });

  const startOfWeekA = startOfWeek(date1, {
    weekStartsOn: options.weekStartsOn,
  });
  const startOfWeekB = startOfWeek(date2, {
    weekStartsOn: options.weekStartsOn,
  });
  return Temporal.PlainDate.compare(startOfWeekA, startOfWeekB) === 0;
}

export function isSameYear(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
): boolean;
export function isSameYear(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
): boolean;
export function isSameYear(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: IsSameDayOptions,
): boolean;

export function isSameYear(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options?: IsSameDayOptions,
): boolean {
  // Handle the simple case of two PlainDates
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return a.year === b.year;
  }

  // Handle the simple case of two ZonedDateTimes with same timezone
  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime &&
    a.timeZoneId === b.timeZoneId
  ) {
    return a.toPlainDate().year === b.toPlainDate().year;
  }

  // For mixed types or different timezones, convert to PlainDate using options
  if (!options) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const date1 = toPlainDate(a, options);
  const date2 = toPlainDate(b, options);

  return date1.year === date2.year;
}

interface IsWithinIntervalOptions {
  timeZone: string;
}

export function isWithinInterval(
  date: Temporal.ZonedDateTime,
  interval: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
  options: IsWithinIntervalOptions,
): boolean;
export function isWithinInterval(
  date: Temporal.PlainDate,
  interval: { start: Temporal.PlainDate; end: Temporal.PlainDate },
): boolean;
export function isWithinInterval(
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
  interval: {
    start: Temporal.PlainDate | Temporal.ZonedDateTime;
    end: Temporal.PlainDate | Temporal.ZonedDateTime;
  },
  options: IsWithinIntervalOptions,
): boolean;

export function isWithinInterval(
  date: Temporal.PlainDate | Temporal.ZonedDateTime,
  interval: {
    start: Temporal.PlainDate | Temporal.ZonedDateTime;
    end: Temporal.PlainDate | Temporal.ZonedDateTime;
  },
  options?: IsWithinIntervalOptions,
): boolean {
  const date1 =
    date instanceof Temporal.ZonedDateTime
      ? date.withTimeZone(options!.timeZone)
      : date;
  const date2 =
    interval.start instanceof Temporal.ZonedDateTime
      ? interval.start.withTimeZone(options!.timeZone)
      : interval.start;
  const date3 =
    interval.end instanceof Temporal.ZonedDateTime
      ? interval.end.withTimeZone(options!.timeZone)
      : interval.end;

  return (
    date1.year >= date2.year &&
    date1.year <= date3.year &&
    date1.month >= date2.month &&
    date1.month <= date3.month &&
    date1.day >= date2.day &&
    date1.day <= date3.day
  );
}

export interface IsTodayOptions {
  timeZone: string;
}

export function isToday(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  { timeZone }: IsTodayOptions,
) {
  const today = Temporal.Now.plainDateISO(timeZone);

  return today.equals(toPlainDate(value, { timeZone }));
}

export function isSameType(
  a: TemporalConvertible,
  b: TemporalConvertible,
): boolean {
  return a.constructor === b.constructor;
}

export function isBefore(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean;
export function isBefore(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
): boolean;
export function isBefore(a: Temporal.Instant, b: Temporal.Instant): boolean;
export function isBefore(
  a: TemporalConvertible,
  b: TemporalConvertible,
  options: IsSameDayOptions,
): boolean;

export function isBefore(
  a: TemporalConvertible,
  b: TemporalConvertible,
  options?: IsSameDayOptions,
): boolean {
  // Handle PlainDate vs PlainDate
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return Temporal.PlainDate.compare(a, b) < 0;
  }

  // Handle Instant vs Instant
  if (a instanceof Temporal.Instant && b instanceof Temporal.Instant) {
    return Temporal.Instant.compare(a, b) < 0;
  }

  // Handle ZonedDateTime vs ZonedDateTime with same timezone
  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime &&
    a.timeZoneId === b.timeZoneId
  ) {
    return Temporal.Instant.compare(a.toInstant(), b.toInstant()) < 0;
  }

  // For mixed types or different timezones, convert to Instant using options
  if (!options) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const instant1 = toInstant(a, options);
  const instant2 = toInstant(b, options);

  return Temporal.Instant.compare(instant1, instant2) < 0;
}

export function isAfter(a: Temporal.PlainDate, b: Temporal.PlainDate): boolean;
export function isAfter(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
): boolean;
export function isAfter(a: Temporal.Instant, b: Temporal.Instant): boolean;
export function isAfter(
  a: TemporalConvertible,
  b: TemporalConvertible,
  options: IsSameDayOptions,
): boolean;

export function isAfter(
  a: TemporalConvertible,
  b: TemporalConvertible,
  options?: IsSameDayOptions,
): boolean {
  // Handle PlainDate vs PlainDate
  if (a instanceof Temporal.PlainDate && b instanceof Temporal.PlainDate) {
    return Temporal.PlainDate.compare(a, b) > 0;
  }

  // Handle Instant vs Instant
  if (a instanceof Temporal.Instant && b instanceof Temporal.Instant) {
    return Temporal.Instant.compare(a, b) > 0;
  }

  // Handle ZonedDateTime vs ZonedDateTime with same timezone
  if (
    a instanceof Temporal.ZonedDateTime &&
    b instanceof Temporal.ZonedDateTime &&
    a.timeZoneId === b.timeZoneId
  ) {
    return Temporal.Instant.compare(a.toInstant(), b.toInstant()) > 0;
  }

  // For mixed types or different timezones, convert to Instant using options
  if (!options) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const instant1 = toInstant(a, options);
  const instant2 = toInstant(b, options);

  return Temporal.Instant.compare(instant1, instant2) > 0;
}
