import type {
  DayOfWeek as MicrosoftDayOfWeek,
  PatternedRecurrence,
  WeekIndex,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type { Recurrence, Weekday } from "../../../interfaces";

const WEEKDAY_MAP: Record<MicrosoftDayOfWeek, Weekday> = {
  monday: "MO",
  tuesday: "TU",
  wednesday: "WE",
  thursday: "TH",
  friday: "FR",
  saturday: "SA",
  sunday: "SU",
};

const WEEK_INDEX_MAP: Record<WeekIndex, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  last: -1,
};

export function parseRecurrence(
  recurrence: PatternedRecurrence,
): Recurrence | undefined {
  const { pattern, range } = recurrence;

  if (!pattern?.type) {
    return undefined;
  }

  const shared: Recurrence = {
    ...(pattern.interval !== undefined ? { interval: pattern.interval } : {}),
    ...(range?.type === "numbered" && range.numberOfOccurrences !== undefined
      ? { count: range.numberOfOccurrences }
      : {}),
    // Graph's endDate is inclusive, matching RFC 5545 UNTIL for date values.
    ...(range?.type === "endDate" && range.endDate
      ? { until: Temporal.PlainDate.from(range.endDate) }
      : {}),
  };

  const byDay = pattern.daysOfWeek?.map((day) => WEEKDAY_MAP[day]);
  const wkst = pattern.firstDayOfWeek
    ? WEEKDAY_MAP[pattern.firstDayOfWeek]
    : undefined;

  switch (pattern.type) {
    case "daily":
      return { ...shared, freq: "DAILY" };
    case "weekly":
      return {
        ...shared,
        freq: "WEEKLY",
        ...(byDay?.length ? { byDay } : {}),
        // Graph defaults firstDayOfWeek to sunday, unlike RFC 5545's implicit
        // WKST=MO, so a missing field must parse as an explicit SU.
        wkst: wkst ?? "SU",
      };
    case "absoluteMonthly":
      return {
        ...shared,
        freq: "MONTHLY",
        ...(pattern.dayOfMonth !== undefined
          ? { byMonthDay: [pattern.dayOfMonth] }
          : {}),
      };
    case "relativeMonthly":
      return {
        ...shared,
        freq: "MONTHLY",
        ...(byDay?.length ? { byDay } : {}),
        bySetPos: [WEEK_INDEX_MAP[pattern.index ?? "first"]],
      };
    case "absoluteYearly":
      return {
        ...shared,
        freq: "YEARLY",
        ...(pattern.month !== undefined ? { byMonth: [pattern.month] } : {}),
        ...(pattern.dayOfMonth !== undefined
          ? { byMonthDay: [pattern.dayOfMonth] }
          : {}),
      };
    case "relativeYearly":
      return {
        ...shared,
        freq: "YEARLY",
        ...(pattern.month !== undefined ? { byMonth: [pattern.month] } : {}),
        ...(byDay?.length ? { byDay } : {}),
        bySetPos: [WEEK_INDEX_MAP[pattern.index ?? "first"]],
      };
    default:
      return undefined;
  }
}
