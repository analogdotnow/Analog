import type {
  DayOfWeek,
  PatternedRecurrence,
  RecurrencePattern,
  RecurrenceRange,
  WeekIndex,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import type { Frequency, Recurrence, Weekday } from "../../../interfaces";
import { MicrosoftEvent } from "../interfaces";
import { parseTimeZone } from "../utils";

const WEEKDAY_MAP: Record<DayOfWeek, Weekday> = {
  sunday: "SU",
  monday: "MO",
  tuesday: "TU",
  wednesday: "WE",
  thursday: "TH",
  friday: "FR",
  saturday: "SA",
};

const WEEK_INDEX_MAP: Record<WeekIndex, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  last: -1,
};

function parseFrequency(pattern: RecurrencePattern): {
  freq?: Frequency;
  bySetPos?: number[];
} {
  switch (pattern.type) {
    case "daily":
      return { freq: "DAILY" };
    case "weekly":
      return { freq: "WEEKLY" };
    case "absoluteMonthly":
      return { freq: "MONTHLY" };
    case "relativeMonthly":
      if (pattern.index) {
        return {
          freq: "MONTHLY",
          bySetPos: [WEEK_INDEX_MAP[pattern.index]],
        };
      }

      return {
        freq: "MONTHLY",
      };
    case "absoluteYearly":
      return { freq: "YEARLY" };
    case "relativeYearly":
      if (pattern.index) {
        return {
          freq: "YEARLY",
          bySetPos: [WEEK_INDEX_MAP[pattern.index]],
        };
      }

      return { freq: "YEARLY" };
    default:
      return {};
  }
}

function parseDaysOfWeek(pattern: RecurrencePattern) {
  if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
    return undefined;
  }

  return pattern.daysOfWeek.map((day) => WEEKDAY_MAP[day]);
}

function parseRecurrenceTimeZone(range: RecurrenceRange, timeZone?: string) {
  if (range.recurrenceTimeZone) {
    return parseTimeZone(range.recurrenceTimeZone) ?? "UTC";
  }

  if (timeZone) {
    return parseTimeZone(timeZone) ?? "UTC";
  }

  return "UTC";
}

function parseRecurrenceRange(range: RecurrenceRange, timeZone?: string) {
  const result: Pick<Recurrence, "count" | "until"> = {};

  if (range.type === "numbered" && range.numberOfOccurrences) {
    result.count = range.numberOfOccurrences;
  }

  if (range.type === "endDate" && range.endDate) {
    const plainDate = Temporal.PlainDate.from(range.endDate);

    result.until = plainDate.toZonedDateTime({
      timeZone: parseRecurrenceTimeZone(range, timeZone),
      plainTime: Temporal.PlainTime.from({ hour: 23, minute: 59, second: 59 }),
    });
  }

  return result;
}

export function parseRecurrence(event: MicrosoftEvent): Recurrence | undefined {
  const recurrence = event.recurrence;
  const timeZone = event.start?.timeZone ?? undefined;

  if (!recurrence?.pattern || !recurrence?.range) {
    return undefined;
  }

  const { freq, bySetPos } = parseFrequency(recurrence.pattern);

  if (!freq && !bySetPos) {
    return undefined;
  }

  return {
    freq,
    interval: parseInterval(recurrence.pattern),
    byDay: parseDaysOfWeek(recurrence.pattern),
    byMonthDay: parseByMonthDay(recurrence.pattern),
    byMonth: parseByMonth(recurrence.pattern),
    bySetPos,
    wkst: parseWkst(recurrence.pattern),
    ...parseRecurrenceRange(recurrence.range, timeZone),
  };
}

function parseInterval(pattern: RecurrencePattern) {
  if (pattern.interval && pattern.interval > 1) {
    return pattern.interval;
  }

  return undefined;
}

function parseByMonthDay(pattern: RecurrencePattern) {
  if (!pattern.dayOfMonth) {
    return undefined;
  }

  return [pattern.dayOfMonth];
}

function parseByMonth(pattern: RecurrencePattern) {
  if (!pattern.month) {
    return undefined;
  }

  return [pattern.month];
}

function parseWkst(pattern: RecurrencePattern) {
  if (!pattern.firstDayOfWeek) {
    return undefined;
  }

  return WEEKDAY_MAP[pattern.firstDayOfWeek];
}
