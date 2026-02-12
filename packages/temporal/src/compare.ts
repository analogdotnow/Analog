import { Temporal } from "temporal-polyfill";

import { toInstant, toPlainDate, toPlainYearMonth } from "./convert";
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
  a: Temporal.PlainDate | Temporal.PlainYearMonth,
  b: Temporal.PlainYearMonth,
): boolean;
export function isSameMonth(
  a: Temporal.PlainYearMonth,
  b: Temporal.PlainDate | Temporal.PlainYearMonth,
): boolean;
export function isSameMonth(
  a: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  b: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: IsSameDayOptions,
): boolean;

export function isSameMonth(
  a:
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | Temporal.PlainYearMonth,
  b:
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | Temporal.PlainYearMonth,
  options?: IsSameDayOptions,
): boolean {
  const month1 = toPlainYearMonth(a, options);
  const month2 = toPlainYearMonth(b, options);

  return Temporal.PlainYearMonth.compare(month1, month2) === 0;
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

export function isSameTime(
  a: Temporal.PlainTime,
  b: Temporal.PlainTime,
): boolean {
  return Temporal.PlainTime.compare(a, b) === 0;
}

interface IsWithinIntervalOptions {
  timeZone: string;
}

export function isWithinInterval(
  value: Temporal.PlainTime,
  interval: { start: Temporal.PlainTime; end: Temporal.PlainTime },
): boolean;
export function isWithinInterval(
  date: Temporal.ZonedDateTime,
  interval: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
  options: IsWithinIntervalOptions,
): boolean;
export function isWithinInterval(
  value: Temporal.PlainDate,
  interval: { start: Temporal.PlainDate; end: Temporal.PlainDate },
): boolean;
export function isWithinInterval(
  value: Temporal.PlainDate | Temporal.ZonedDateTime,
  interval: {
    start: Temporal.PlainDate | Temporal.ZonedDateTime;
    end: Temporal.PlainDate | Temporal.ZonedDateTime;
  },
  options: IsWithinIntervalOptions,
): boolean;

export function isWithinInterval(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.PlainTime,
  interval: {
    start: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.PlainTime;
    end: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.PlainTime;
  },
  options?: IsWithinIntervalOptions,
): boolean {
  if (
    value instanceof Temporal.PlainTime &&
    interval.start instanceof Temporal.PlainTime &&
    interval.end instanceof Temporal.PlainTime
  ) {
    return (
      Temporal.PlainTime.compare(value, interval.start) >= 0 &&
      Temporal.PlainTime.compare(value, interval.end) <= 0
    );
  }

  if (
    value instanceof Temporal.PlainDate &&
    interval.start instanceof Temporal.PlainDate &&
    interval.end instanceof Temporal.PlainDate
  ) {
    return (
      Temporal.PlainDate.compare(value, interval.start) >= 0 &&
      Temporal.PlainDate.compare(value, interval.end) <= 0
    );
  }

  if (
    value instanceof Temporal.ZonedDateTime &&
    interval.start instanceof Temporal.ZonedDateTime &&
    interval.end instanceof Temporal.ZonedDateTime
  ) {
    return (
      Temporal.ZonedDateTime.compare(value, interval.start) >= 0 &&
      Temporal.ZonedDateTime.compare(value, interval.end) <= 0
    );
  }

  if (
    value instanceof Temporal.PlainTime ||
    interval.start instanceof Temporal.PlainTime ||
    interval.end instanceof Temporal.PlainTime
  ) {
    throw new Error("PlainTime can only be compared with PlainTime");
  }

  if (!options) {
    throw new Error(
      "options with timeZone required when comparing different types or timezones",
    );
  }

  const date = toPlainDate(value, options);
  const start = toPlainDate(interval.start, options);
  const end = toPlainDate(interval.end, options);

  return (
    Temporal.PlainDate.compare(date, start) >= 0 &&
    Temporal.PlainDate.compare(date, end) <= 0
  );
}

export interface IsTodayOptions {
  timeZone: string;
}

export function isToday(value: Temporal.ZonedDateTime): boolean;
export function isToday(
  value: Temporal.PlainDate | Temporal.Instant,
  options: IsTodayOptions,
): boolean;
export function isToday(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options: IsTodayOptions,
): boolean;

export function isToday(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  options?: IsTodayOptions,
): boolean {
  if (value instanceof Temporal.ZonedDateTime) {
    const today = Temporal.Now.plainDateISO(
      options?.timeZone ?? value.timeZoneId,
    );

    return today.equals(toPlainDate(value));
  }

  if (!options) {
    throw new Error("options with timeZone required for PlainDate and Instant");
  }

  const today = Temporal.Now.plainDateISO(options.timeZone);

  return today.equals(toPlainDate(value, options));
}

export function isBefore(a: Temporal.PlainTime, b: Temporal.PlainTime): boolean;
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
  a: TemporalConvertible | Temporal.PlainTime,
  b: TemporalConvertible | Temporal.PlainTime,
  options?: IsSameDayOptions,
): boolean {
  // Handle PlainTime vs PlainTime
  if (a instanceof Temporal.PlainTime && b instanceof Temporal.PlainTime) {
    return Temporal.PlainTime.compare(a, b) < 0;
  }

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
    return Temporal.ZonedDateTime.compare(a, b) < 0;
  }

  // PlainTime cannot be mixed with other types
  if (a instanceof Temporal.PlainTime || b instanceof Temporal.PlainTime) {
    throw new Error("PlainTime can only be compared with PlainTime");
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

export function isAfter(a: Temporal.PlainTime, b: Temporal.PlainTime): boolean;
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
  a: TemporalConvertible | Temporal.PlainTime,
  b: TemporalConvertible | Temporal.PlainTime,
  options?: IsSameDayOptions,
): boolean {
  // Handle PlainTime vs PlainTime
  if (a instanceof Temporal.PlainTime && b instanceof Temporal.PlainTime) {
    return Temporal.PlainTime.compare(a, b) > 0;
  }

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
    return Temporal.ZonedDateTime.compare(a, b) > 0;
  }

  // PlainTime cannot be mixed with other types
  if (a instanceof Temporal.PlainTime || b instanceof Temporal.PlainTime) {
    throw new Error("PlainTime can only be compared with PlainTime");
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

export function intervalsOverlap(
  a: { start: Temporal.PlainTime; end: Temporal.PlainTime },
  b: { start: Temporal.PlainTime; end: Temporal.PlainTime },
): boolean;
export function intervalsOverlap(
  a: { start: Temporal.PlainDate; end: Temporal.PlainDate },
  b: { start: Temporal.PlainDate; end: Temporal.PlainDate },
): boolean;
export function intervalsOverlap(
  a: { start: Temporal.Instant; end: Temporal.Instant },
  b: { start: Temporal.Instant; end: Temporal.Instant },
): boolean;
export function intervalsOverlap(
  a: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
  b: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
): boolean;
export function intervalsOverlap(
  a: { start: Temporal.PlainDate; end: Temporal.PlainDate },
  b: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
): boolean;
export function intervalsOverlap(
  a: { start: Temporal.ZonedDateTime; end: Temporal.ZonedDateTime },
  b: { start: Temporal.PlainDate; end: Temporal.PlainDate },
): boolean;

export function intervalsOverlap(
  a: {
    start:
      | Temporal.PlainDate
      | Temporal.Instant
      | Temporal.ZonedDateTime
      | Temporal.PlainTime;
    end:
      | Temporal.PlainDate
      | Temporal.Instant
      | Temporal.ZonedDateTime
      | Temporal.PlainTime;
  },
  b: {
    start:
      | Temporal.PlainDate
      | Temporal.Instant
      | Temporal.ZonedDateTime
      | Temporal.PlainTime;
    end:
      | Temporal.PlainDate
      | Temporal.Instant
      | Temporal.ZonedDateTime
      | Temporal.PlainTime;
  },
): boolean {
  // Handle PlainTime intervals
  if (
    a.start instanceof Temporal.PlainTime &&
    b.start instanceof Temporal.PlainTime
  ) {
    return (
      Temporal.PlainTime.compare(a.start, b.end as Temporal.PlainTime) <= 0 &&
      Temporal.PlainTime.compare(a.end as Temporal.PlainTime, b.start) >= 0
    );
  }

  if (
    a.start instanceof Temporal.PlainTime ||
    b.start instanceof Temporal.PlainTime ||
    a.end instanceof Temporal.PlainTime ||
    b.end instanceof Temporal.PlainTime
  ) {
    throw new Error(
      "PlainTime intervals can only be compared with PlainTime intervals",
    );
  }

  const aDate = toPlainDateInterval({ start: a.start, end: a.end });
  const bDate = toPlainDateInterval({ start: b.start, end: b.end });

  if (aDate && bDate) {
    return (
      Temporal.PlainDate.compare(aDate.start, bDate.end) <= 0 &&
      Temporal.PlainDate.compare(aDate.end, bDate.start) >= 0
    );
  }

  if (
    a.start instanceof Temporal.Instant &&
    b.start instanceof Temporal.Instant
  ) {
    return (
      Temporal.Instant.compare(a.start, b.end as Temporal.Instant) <= 0 &&
      Temporal.Instant.compare(a.end as Temporal.Instant, b.start) >= 0
    );
  }

  throw new Error("Interval types must match");
}

function toPlainDateInterval(interval: {
  start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  end: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
}): { start: Temporal.PlainDate; end: Temporal.PlainDate } | null {
  if (interval.start instanceof Temporal.PlainDate) {
    return {
      start: interval.start,
      end: interval.end as Temporal.PlainDate,
    };
  }
  if (interval.start instanceof Temporal.ZonedDateTime) {
    return {
      start: interval.start.toPlainDate(),
      end: (interval.end as Temporal.ZonedDateTime).toPlainDate(),
    };
  }
  return null;
}
