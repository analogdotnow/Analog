import { Temporal } from "temporal-polyfill";

interface StartOfWeekOptions {
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

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
export function startOfMonth(
  value: Temporal.PlainYearMonth,
): Temporal.PlainDate;

export function startOfMonth(
  value: Temporal.ZonedDateTime | Temporal.PlainDate | Temporal.PlainYearMonth,
) {
  if (value instanceof Temporal.PlainYearMonth) {
    return value.toPlainDate({ day: 1 });
  }

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
