import type {
  DayOfWeek,
  PatternedRecurrence,
  RecurrencePattern,
  RecurrenceRange,
  WeekIndex,
} from "@microsoft/microsoft-graph-types";
import { Temporal } from "temporal-polyfill";

import type { CreateEventInput, UpdateEventInput } from "@repo/schemas";

import type { Recurrence, Weekday } from "../../../interfaces";

const WEEKDAY_REVERSE_MAP: Record<Weekday, DayOfWeek> = {
  SU: "sunday",
  MO: "monday",
  TU: "tuesday",
  WE: "wednesday",
  TH: "thursday",
  FR: "friday",
  SA: "saturday",
};

const WEEK_INDEX_REVERSE_MAP: Record<number, WeekIndex> = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  [-1]: "last",
};

function formatDate(
  date: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
) {
  if (date instanceof Temporal.PlainDate) {
    return date.toString();
  }

  if (date instanceof Temporal.ZonedDateTime) {
    return date.toPlainDate().toString();
  }

  return date.toZonedDateTimeISO("UTC").toPlainDate().toString();
}

function formatRecurrencePatternType(
  recurrence: Recurrence,
): RecurrencePattern["type"] | undefined {
  if (!recurrence.freq) {
    return undefined;
  }

  switch (recurrence.freq) {
    case "DAILY":
      return "daily";
    case "WEEKLY":
      return "weekly";
    case "MONTHLY":
      if (recurrence.bySetPos && recurrence.byDay) {
        return "relativeMonthly";
      }

      return "absoluteMonthly";
    case "YEARLY":
      if (recurrence.bySetPos && recurrence.byDay) {
        return "relativeYearly";
      }

      return "absoluteYearly";
    default:
      return undefined;
  }
}

function formatDaysOfWeek(byDay: Weekday[] | undefined) {
  if (!byDay || byDay.length === 0) {
    return undefined;
  }

  return byDay.map((day) => WEEKDAY_REVERSE_MAP[day]);
}

function formatWeekIndex(bySetPos: number[] | undefined) {
  if (!bySetPos || bySetPos.length === 0) {
    return undefined;
  }

  const pos = bySetPos[0]!;

  return WEEK_INDEX_REVERSE_MAP[pos];
}

function formatRecurrenceRange(
  recurrence: Recurrence,
  startDate: string,
): RecurrenceRange {
  if (recurrence.count) {
    return {
      type: "numbered",
      startDate,
      numberOfOccurrences: recurrence.count,
    };
  }

  if (recurrence.until) {
    return {
      type: "endDate",
      startDate,
      endDate: formatDate(recurrence.until),
    };
  }

  return {
    type: "noEnd",
    startDate,
  };
}

export function formatRecurrence(event: CreateEventInput | UpdateEventInput) {
  const recurrence = event.recurrence;

  if (!recurrence || !recurrence.freq) {
    return undefined;
  }

  const patternType = formatRecurrencePatternType(recurrence);

  if (!patternType) {
    return undefined;
  }

  const pattern: RecurrencePattern = {
    type: patternType,
    interval: recurrence.interval ?? 1,
    ...(recurrence.byDay
      ? { daysOfWeek: formatDaysOfWeek(recurrence.byDay) }
      : {}),
    ...(recurrence.byMonthDay && recurrence.byMonthDay.length > 0
      ? { dayOfMonth: recurrence.byMonthDay[0] }
      : {}),
    // TODO: handle string months
    ...(recurrence.byMonth && recurrence.byMonth.length > 0
      ? {
          month: recurrence.byMonth[0],
        }
      : {}),
    ...(recurrence.bySetPos
      ? { index: formatWeekIndex(recurrence.bySetPos) }
      : {}),
    ...(recurrence.wkst
      ? { firstDayOfWeek: WEEKDAY_REVERSE_MAP[recurrence.wkst] }
      : {}),
  };

  return {
    pattern,
    range: formatRecurrenceRange(recurrence, formatDate(event.start)),
  };
}
