import { Temporal } from "temporal-polyfill";

import { Frequency, Recurrence, Weekday } from "../../../interfaces";

interface ParseIcsDateTimeOptions {
  value: string;
  timeZone?: string;
  defaultTimeZone: string;
  valueType?: string;
}

function parseDateTime({
  value,
  timeZone,
  defaultTimeZone,
  valueType,
}: ParseIcsDateTimeOptions) {
  const isoDate = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;

  if (valueType === "DATE" || !value.includes("T")) {
    return Temporal.PlainDate.from(isoDate);
  }

  if (value.endsWith("Z")) {
    const isoDateTime = `${isoDate}T${value.slice(9, 15)}Z`;

    const instant = Temporal.Instant.from(isoDateTime);

    return timeZone ? instant.toZonedDateTimeISO(timeZone) : instant;
  }

  const isoDateTime = `${isoDate}T${value.slice(9)}`;

  return Temporal.PlainDateTime.from(isoDateTime).toZonedDateTime(
    timeZone ?? defaultTimeZone,
  );
}

const EXDATE_LINE_REGEX = /^EXDATE(?:;VALUE=([^;]+))?(?:;TZID=([^:]+))?:(.+)/i;
const DATE_LINE_REGEX = /^RDATE(?:;VALUE=([^;]+))?(?:;TZID=([^:]+))?:(.+)/i;

interface ParseDateLinesOptions {
  lines: string[];
  linePrefix: "EXDATE" | "RDATE";
  defaultTimeZone: string;
}

function parseDateLines({
  lines,
  linePrefix,
  defaultTimeZone,
}: ParseDateLinesOptions) {
  const dates: (
    | Temporal.ZonedDateTime
    | Temporal.PlainDate
    | Temporal.Instant
  )[] = [];

  const regex = linePrefix === "EXDATE" ? EXDATE_LINE_REGEX : DATE_LINE_REGEX;

  for (const line of lines) {
    const match = line.match(regex);

    if (match) {
      const [, valueType, timeZone, dateValuesStr] = match;
      const dateValues = dateValuesStr!.split(",");

      dates.push(
        ...dateValues.map((value) =>
          parseDateTime({ value, timeZone, defaultTimeZone, valueType }),
        ),
      );
    }
  }

  return dates;
}

function parseNumberArray(input: string, sort = false): number[] {
  const values = input.split(",").map((n) => parseInt(n, 10));

  if (!sort) {
    return values;
  }

  return values.sort((a, b) => a - b);
}

const BYMONTH_REGEX = /^\d+L$/i;

function parseByMonthArray(input: string): Array<number | string> {
  return input.split(",").map((value) => {
    const token = value.trim();

    if (BYMONTH_REGEX.test(token)) {
      return token.toUpperCase();
    }

    const n = parseInt(token, 10);

    return Number.isFinite(n) ? n : token;
  });
}

const EXDATE_REGEX = /^EXDATE/i;

interface ParseExDateOptions {
  lines: string[];
  defaultTimeZone: string;
}

function parseExDate({ lines, defaultTimeZone }: ParseExDateOptions) {
  const exLines = lines.filter((line) => EXDATE_REGEX.test(line));

  return parseDateLines({
    lines: exLines,
    linePrefix: "EXDATE",
    defaultTimeZone,
  });
}

const RDATE_REGEX = /^RDATE/i;

interface ParseRDateOptions {
  lines: string[];
  defaultTimeZone: string;
}

function parseRDate({ lines, defaultTimeZone }: ParseRDateOptions) {
  const rLines = lines.filter((line) => RDATE_REGEX.test(line));

  return parseDateLines({
    lines: rLines,
    linePrefix: "RDATE",
    defaultTimeZone,
  });
}

interface ParseDtstartOptions {
  lines: string[];
  defaultTimeZone: string;
}

const DTSTART_LINE_REGEX = /DTSTART(?:;VALUE=([^;]+))?(?:;TZID=([^:]+))?:(.+)/i;
const DTSTART_REGEX = /^DTSTART/i;

function parseDtstart({ lines, defaultTimeZone }: ParseDtstartOptions) {
  const dtLine = lines.find((line) => DTSTART_REGEX.test(line));

  if (!dtLine) {
    return undefined;
  }

  const match = dtLine.match(DTSTART_LINE_REGEX);

  if (!match) {
    throw new Error("Invalid DTSTART format");
  }

  const [, valueType, timeZone, value] = match;

  return parseDateTime({
    value: value!,
    timeZone,
    defaultTimeZone,
    valueType,
  });
}

function parseRRuleLine(lines: string[]) {
  const rrLine = lines.find((line) => /^RRULE:/i.test(line));

  if (rrLine) {
    return rrLine;
  }

  return undefined;
}

function parseSkip(input: string) {
  const value = input.toUpperCase();

  if (!["OMIT", "BACKWARD", "FORWARD"].includes(value)) {
    throw new Error(`Invalid SKIP value: ${input}`);
  }

  return value as "OMIT" | "BACKWARD" | "FORWARD";
}

function parseRscale(input: string) {
  const value = input.toUpperCase();

  if (!["GREGORIAN", "ISO8601"].includes(value)) {
    throw new Error(`Unsupported RSCALE value: ${input}`);
  }

  return value as "GREGORIAN" | "ISO8601";
}

function parseFrequency(input: string): Frequency {
  const value = input.toUpperCase();

  if (
    !Object.values([
      "SECONDLY",
      "MINUTELY",
      "HOURLY",
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "YEARLY",
    ]).includes(value)
  ) {
    throw new Error(`Invalid FREQ value: ${input}`);
  }

  return value as Frequency;
}

const RRULE_REGEX = /^RRULE:/i;

interface ParseRRuleOptions {
  lines: string[];
}

function parseRRule({ lines }: ParseRRuleOptions) {
  const rruleLine = parseRRuleLine(lines);

  if (!rruleLine) {
    return undefined;
  }

  const parts = rruleLine.replace(RRULE_REGEX, "").split(";");

  const recurrence: Recurrence = {};

  let pendingSkip: "OMIT" | "BACKWARD" | "FORWARD" | undefined;

  for (const part of parts) {
    const [key, value] = part.split("=");

    if (!key || !value) {
      continue;
    }

    switch (key.toUpperCase()) {
      case "RSCALE":
        recurrence.rscale = parseRscale(value);

        if (pendingSkip && !recurrence.skip) {
          recurrence.skip = pendingSkip;
          pendingSkip = undefined;
        }

        break;
      case "SKIP":
        if (recurrence.rscale) {
          recurrence.skip = parseSkip(value);
        } else {
          pendingSkip = parseSkip(value);
        }

        break;
      case "FREQ":
        recurrence.freq = parseFrequency(value);
        break;
      case "INTERVAL":
        recurrence.interval = parseInt(value, 10);
        break;
      case "COUNT":
        recurrence.count = parseInt(value, 10);
        break;
      case "UNTIL":
        recurrence.until = parseDateTime({
          value: value,
          defaultTimeZone: "UTC",
        });
        break;
      case "BYHOUR":
        recurrence.byHour = parseNumberArray(value, true);
        break;
      case "BYMINUTE":
        recurrence.byMinute = parseNumberArray(value, true);
        break;
      case "BYSECOND":
        recurrence.bySecond = parseNumberArray(value, true);
        break;
      case "BYDAY":
        // TODO: Add proper support for RFC 7529 weekday tokens with a number prefix (e.g., "2FR", "-1SU").
        recurrence.byDay = value.split(",") as Weekday[];
        break;
      case "BYMONTH":
        // TODO: Add proper support for RFC 7529 leap-month tokens with an "L" suffix (e.g., "5L").
        recurrence.byMonth = parseByMonthArray(value) as number[];
        break;
      case "BYMONTHDAY":
        recurrence.byMonthDay = parseNumberArray(value);
        break;
      case "BYYEARDAY":
        recurrence.byYearDay = parseNumberArray(value);
        break;
      case "BYWEEKNO":
        recurrence.byWeekNo = parseNumberArray(value);
        break;
      case "BYSETPOS":
        recurrence.bySetPos = parseNumberArray(value);
        break;
      case "WKST":
        recurrence.wkst = value as Weekday;
        break;
    }
  }

  if (pendingSkip && !recurrence.rscale) {
    throw new Error("SKIP MUST NOT be present unless RSCALE is present");
  }

  if (pendingSkip && recurrence.rscale && !recurrence.skip) {
    recurrence.skip = pendingSkip;
  }

  return recurrence;
}

interface ParseTextRecurrenceOptions {
  lines: string[];
  defaultTimeZone: string;
}

export function parseTextRecurrence({
  lines,
  defaultTimeZone,
}: ParseTextRecurrenceOptions): Recurrence {
  const dtstart = parseDtstart({ lines, defaultTimeZone });
  const exDate = parseExDate({ lines, defaultTimeZone });
  const rDate = parseRDate({ lines, defaultTimeZone });

  const rrule = parseRRule({ lines });

  return {
    ...(rrule ? rrule : {}),
    dtstart,
    exDate,
    rDate,
  };
}
