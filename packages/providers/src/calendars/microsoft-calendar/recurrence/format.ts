import type {
  DayOfWeek as MicrosoftDayOfWeek,
  PatternedRecurrence,
  RecurrencePattern,
  RecurrenceRange,
  WeekIndex,
} from "@analog/microsoft-calendar";
import { Temporal } from "temporal-polyfill";

import type { UpdateEventPatch } from "@repo/schemas";
import { toPlainDate, toZonedDateTime } from "@repo/temporal";

import type { Recurrence, Weekday } from "../../../interfaces";
import { parseTimeZone } from "../utils";

const WEEKDAY_REVERSE_MAP: Record<Weekday, MicrosoftDayOfWeek> = {
  MO: "monday",
  TU: "tuesday",
  WE: "wednesday",
  TH: "thursday",
  FR: "friday",
  SA: "saturday",
  SU: "sunday",
};

// ISO dayOfWeek is 1 (Monday) through 7 (Sunday).
const ISO_DAY_MAP: MicrosoftDayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export class RecurrenceConversionError extends Error {
  constructor(message: string) {
    super(`Cannot convert recurrence for Microsoft Calendar: ${message}`);
    this.name = "RecurrenceConversionError";
  }
}

function formatWeekIndex(recurrence: Recurrence): WeekIndex {
  const bySetPos = recurrence.bySetPos;

  if (!bySetPos || bySetPos.length !== 1) {
    throw new RecurrenceConversionError(
      "bySetPos must contain exactly one of 1, 2, 3, 4, or -1",
    );
  }

  switch (bySetPos[0]) {
    case 1:
      return "first";
    case 2:
      return "second";
    case 3:
      return "third";
    case 4:
      return "fourth";
    case -1:
      return "last";
    default:
      throw new RecurrenceConversionError(
        `bySetPos value ${bySetPos[0]} has no Microsoft equivalent (supported: 1, 2, 3, 4, -1)`,
      );
  }
}

function formatDaysOfWeek(byDay: Weekday[]): MicrosoftDayOfWeek[] {
  return byDay.map((day) => WEEKDAY_REVERSE_MAP[day]);
}

function formatDayOfWeek(dayOfWeek: number): MicrosoftDayOfWeek {
  const day = ISO_DAY_MAP[dayOfWeek - 1];

  if (!day) {
    throw new RecurrenceConversionError(`invalid ISO weekday ${dayOfWeek}`);
  }

  return day;
}

function assertConvertibleRecurrence(recurrence: Recurrence) {
  const unsupported: string[] = [];

  if (recurrence.byYearDay?.length) unsupported.push("byYearDay");
  if (recurrence.byWeekNo?.length) unsupported.push("byWeekNo");
  if (recurrence.byHour?.length) unsupported.push("byHour");
  if (recurrence.byMinute?.length) unsupported.push("byMinute");
  if (recurrence.bySecond?.length) unsupported.push("bySecond");
  if (recurrence.rDate?.length) unsupported.push("rDate");
  if (recurrence.exDate?.length) unsupported.push("exDate");

  if (recurrence.rscale && recurrence.rscale !== "GREGORIAN") {
    unsupported.push(`rscale=${recurrence.rscale}`);
  }

  if (recurrence.skip && recurrence.skip !== "OMIT") {
    unsupported.push(`skip=${recurrence.skip}`);
  }

  if (unsupported.length > 0) {
    throw new RecurrenceConversionError(
      `unsupported rule parts: ${unsupported.join(", ")}`,
    );
  }

  if (recurrence.count !== undefined && recurrence.until !== undefined) {
    throw new RecurrenceConversionError(
      "count and until are mutually exclusive",
    );
  }

  if (recurrence.freq === "WEEKLY" && recurrence.bySetPos?.length) {
    throw new RecurrenceConversionError("bySetPos is not supported for WEEKLY");
  }

  if (
    recurrence.until !== undefined &&
    !(recurrence.until instanceof Temporal.PlainDate)
  ) {
    throw new RecurrenceConversionError(
      "Microsoft recurrence only supports date-valued until",
    );
  }
}

function formatRecurrencePattern(
  recurrence: Recurrence,
  start: Temporal.ZonedDateTime,
): RecurrencePattern {
  const interval = recurrence.interval ?? 1;

  if (recurrence.byMonth && recurrence.freq !== "YEARLY") {
    throw new RecurrenceConversionError(
      `byMonth is only supported for YEARLY, got ${recurrence.freq}`,
    );
  }

  if (
    recurrence.byMonthDay &&
    recurrence.freq !== "MONTHLY" &&
    recurrence.freq !== "YEARLY"
  ) {
    throw new RecurrenceConversionError(
      `byMonthDay is only supported for MONTHLY and YEARLY, got ${recurrence.freq}`,
    );
  }

  switch (recurrence.freq) {
    case "DAILY": {
      if (recurrence.byDay?.length) {
        throw new RecurrenceConversionError("byDay is not supported for DAILY");
      }

      return { type: "daily", interval };
    }
    case "WEEKLY": {
      return {
        type: "weekly",
        interval,
        daysOfWeek: recurrence.byDay?.length
          ? formatDaysOfWeek(recurrence.byDay)
          : [formatDayOfWeek(start.dayOfWeek)],
        firstDayOfWeek: WEEKDAY_REVERSE_MAP[recurrence.wkst ?? "MO"],
      };
    }
    case "MONTHLY": {
      if (recurrence.byDay?.length) {
        return {
          type: "relativeMonthly",
          interval,
          daysOfWeek: formatDaysOfWeek(recurrence.byDay),
          index: formatWeekIndex(recurrence),
        };
      }

      if (recurrence.byMonthDay && recurrence.byMonthDay.length !== 1) {
        throw new RecurrenceConversionError(
          "byMonthDay must contain exactly one day for MONTHLY",
        );
      }

      const dayOfMonth = recurrence.byMonthDay?.[0] ?? start.day;

      // RFC 5545 skips months without this day, but Outlook substitutes the
      // month's last day, silently changing the rule's meaning.
      if (dayOfMonth > 28) {
        throw new RecurrenceConversionError(
          `MONTHLY on day ${dayOfMonth} means "last day" in short months on Outlook, unlike the RFC rule`,
        );
      }

      return { type: "absoluteMonthly", interval, dayOfMonth };
    }
    case "YEARLY": {
      if (recurrence.byMonth && recurrence.byMonth.length !== 1) {
        throw new RecurrenceConversionError(
          "byMonth must contain exactly one month for YEARLY",
        );
      }

      const month = recurrence.byMonth?.[0] ?? start.month;

      if (recurrence.byDay?.length) {
        return {
          type: "relativeYearly",
          interval,
          month,
          daysOfWeek: formatDaysOfWeek(recurrence.byDay),
          index: formatWeekIndex(recurrence),
        };
      }

      if (recurrence.byMonthDay && recurrence.byMonthDay.length !== 1) {
        throw new RecurrenceConversionError(
          "byMonthDay must contain exactly one day for YEARLY",
        );
      }

      const dayOfMonth = recurrence.byMonthDay?.[0] ?? start.day;

      // Same Outlook substitution as MONTHLY: Feb 29 and days beyond a fixed
      // month's length roll to the month's last day instead of skipping.
      const stableDays =
        month === 2 ? 28 : [4, 6, 9, 11].includes(month) ? 30 : 31;

      if (dayOfMonth > stableDays) {
        throw new RecurrenceConversionError(
          `YEARLY on month ${month}, day ${dayOfMonth} does not occur every year and rolls to the month's last day on Outlook`,
        );
      }

      return { type: "absoluteYearly", interval, month, dayOfMonth };
    }
    default: {
      throw new RecurrenceConversionError(
        `frequency ${recurrence.freq ?? "(none)"} is not supported`,
      );
    }
  }
}

interface FormatRecurrenceOptions {
  recurrence: Recurrence;
  // The series master's start, never a selected occurrence's: Graph requires
  // range.startDate to match the master event's start date.
  start: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  recurrenceTimeZone?: string;
}

export function formatRecurrence({
  recurrence,
  start,
  recurrenceTimeZone,
}: FormatRecurrenceOptions): PatternedRecurrence {
  assertConvertibleRecurrence(recurrence);

  // Graph gets the zone verbatim (it may be a Windows name); Temporal
  // conversions need the IANA equivalent.
  const timeZone =
    recurrenceTimeZone ??
    (start instanceof Temporal.ZonedDateTime ? start.timeZoneId : "UTC");
  const conversionTimeZone = parseTimeZone(timeZone) ?? "UTC";

  // Graph expects range dates and pattern defaults (weekday, day of month)
  // in recurrenceTimeZone, not the zone the event happened to be parsed in
  // (events.get parses in the requested Prefer time zone, typically UTC).
  const startDate = toPlainDate(start, { timeZone: conversionTimeZone });

  const range: RecurrenceRange = {
    startDate: startDate.toString(),
    recurrenceTimeZone: timeZone,
    ...(recurrence.count !== undefined
      ? { type: "numbered", numberOfOccurrences: recurrence.count }
      : recurrence.until !== undefined
        ? {
            type: "endDate",
            endDate: toPlainDate(recurrence.until, {
              timeZone: conversionTimeZone,
            }).toString(),
          }
        : { type: "noEnd" }),
  };

  return {
    pattern: formatRecurrencePattern(
      recurrence,
      toZonedDateTime(start, { timeZone: conversionTimeZone }),
    ),
    range,
  };
}

export function formatRecurrencePatch(
  recurrence: UpdateEventPatch["recurrence"],
  start:
    | Temporal.PlainDate
    | Temporal.Instant
    | Temporal.ZonedDateTime
    | undefined,
  recurrenceTimeZone?: string,
) {
  if (recurrence === undefined) return {};
  if (recurrence === null) return { recurrence: null };

  if (!start) {
    throw new RecurrenceConversionError(
      "a recurrence change requires the event start to anchor range.startDate",
    );
  }

  return {
    recurrence: formatRecurrence({
      recurrence,
      start,
      recurrenceTimeZone,
    }),
  };
}
