import { Temporal } from "temporal-polyfill";

interface StartOfWeekOptions {
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

type TemporalConvertible =
  | Temporal.ZonedDateTime
  | Temporal.PlainDate
  | Temporal.Instant;

export function startOfWeek(
  value: Temporal.ZonedDateTime,
  options: StartOfWeekOptions,
): Temporal.ZonedDateTime;
export function startOfWeek(
  value: Temporal.PlainDate,
  options: StartOfWeekOptions,
): Temporal.PlainDate;

export function startOfWeek<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(value: T, options: StartOfWeekOptions) {
  const diff = (value.dayOfWeek - options.weekStartsOn + 7) % 7;

  if (value instanceof Temporal.PlainDate) {
    return value.subtract({ days: diff });
  }

  return value.subtract({ days: diff }).withPlainTime({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}

interface EndOfWeekOptions {
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function endOfWeek(
  value: Temporal.ZonedDateTime,
  options: EndOfWeekOptions,
): Temporal.ZonedDateTime;
export function endOfWeek(
  value: Temporal.PlainDate,
  options: EndOfWeekOptions,
): Temporal.PlainDate;

export function endOfWeek<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(value: T, options: EndOfWeekOptions) {
  const diff = (value.dayOfWeek - options.weekStartsOn + 7) % 7;

  if (value instanceof Temporal.PlainDate) {
    return value.add({ days: 6 - diff });
  }

  return value.add({ days: 6 - diff }).withPlainTime({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

interface StartOfDayOptions {
  timeZone: string;
}

export function startOfDay(
  value: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime;
export function startOfDay(
  value: Temporal.PlainDate,
  options: StartOfDayOptions,
): Temporal.ZonedDateTime;

export function startOfDay<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(value: T, options?: StartOfDayOptions) {
  if (value instanceof Temporal.PlainDate) {
    if (!options) {
      throw new Error(
        "options with timeZone required when converting PlainDate to ZonedDateTime",
      );
    }

    return value.toZonedDateTime({
      timeZone: options!.timeZone,
      plainTime: {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0,
      },
    });
  }

  return value.withPlainTime({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}

interface EndOfDayOptions {
  timeZone: string;
}

export function endOfDay(value: Temporal.ZonedDateTime): Temporal.ZonedDateTime;
export function endOfDay(
  value: Temporal.PlainDate,
  options: EndOfDayOptions,
): Temporal.ZonedDateTime;

export function endOfDay<T extends Temporal.ZonedDateTime | Temporal.PlainDate>(
  value: T,
  options?: EndOfDayOptions,
) {
  if (value instanceof Temporal.PlainDate) {
    if (!options) {
      throw new Error(
        "options with timeZone required when converting PlainDate to ZonedDateTime",
      );
    }

    return value.toZonedDateTime({
      timeZone: options!.timeZone,
      plainTime: {
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
        microsecond: 999,
        nanosecond: 999,
      },
    });
  }

  return value.withPlainTime({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

export function startOfMonth(
  value: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime;
export function startOfMonth(value: Temporal.PlainDate): Temporal.PlainDate;

export function startOfMonth<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(value: T) {
  if (value instanceof Temporal.PlainDate) {
    return value.with({ day: 1 });
  }

  return value.with({ day: 1 }).withPlainTime({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}

export function endOfMonth(
  value: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime;
export function endOfMonth(value: Temporal.PlainDate): Temporal.PlainDate;

export function endOfMonth<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(value: T) {
  if (value instanceof Temporal.PlainDate) {
    return value.with({ day: value.daysInMonth });
  }

  return value.with({ day: value.daysInMonth }).withPlainTime({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

export function eachDayOfInterval<T extends Temporal.ZonedDateTime>(
  start: T,
  end: T,
): T[];
export function eachDayOfInterval<T extends Temporal.PlainDate>(
  start: T,
  end: T,
): T[];
export function eachDayOfInterval<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(start: T, end: T, options: { timeZone: string }): T[];

export function eachDayOfInterval<
  T extends Temporal.ZonedDateTime | Temporal.PlainDate,
>(start: T, end: T): T[] {
  const result: T[] = [];

  // Normalize start and end to the beginning of their respective days
  let current: T;
  let endDate: T;

  if (
    start instanceof Temporal.ZonedDateTime &&
    end instanceof Temporal.ZonedDateTime
  ) {
    current = start.withPlainTime({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      microsecond: 0,
      nanosecond: 0,
    }) as T;
    endDate = end.withPlainTime({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      microsecond: 0,
      nanosecond: 0,
    }) as T;
  } else {
    current = start;
    endDate = end;
  }

  // Iterate through each day from start to end (inclusive)
  while (true) {
    // Compare dates properly based on type
    let comparison: number;
    if (
      current instanceof Temporal.ZonedDateTime &&
      endDate instanceof Temporal.ZonedDateTime
    ) {
      comparison = Temporal.PlainDate.compare(
        current.toPlainDate(),
        endDate.toPlainDate(),
      );
    } else {
      comparison = Temporal.PlainDate.compare(current, endDate);
    }

    if (comparison > 0) break;

    result.push(current);
    current = current.add({ days: 1 }) as T;
  }

  return result;
}

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

interface ToPlainDateOptions {
  timeZone: string;
}

function toPlainDate(
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

function toZonedDateTime(
  date: Temporal.ZonedDateTime | Temporal.Instant,
  options: ToZonedDateTimeOptions,
): Temporal.ZonedDateTime {
  if (date instanceof Temporal.ZonedDateTime) {
    return date;
  }

  return date.toZonedDateTimeISO(options.timeZone);
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

function toInstant(
  date: TemporalConvertible,
  options: IsSameDayOptions,
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
