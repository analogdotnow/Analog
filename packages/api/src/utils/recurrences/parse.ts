import { Temporal } from "temporal-polyfill";

import { Frequency, Recurrence, Weekday } from "../../interfaces/events";

function parseUTCDateTime(
  dateString: string,
): Temporal.Instant | Temporal.PlainDate {
  // Expect formats like 20231225Z (date) or 20231225T120000Z (datetime)
  const formatted = dateString.slice(0, -1);
  const year = parseInt(formatted.slice(0, 4));
  const month = parseInt(formatted.slice(4, 6));
  const day = parseInt(formatted.slice(6, 8));

  if (formatted.length === 8) {
    return Temporal.PlainDate.from({ year, month, day });
  }

  const hour = parseInt(formatted.slice(9, 11));
  const minute = parseInt(formatted.slice(11, 13));
  const second = parseInt(formatted.slice(13, 15)) || 0;

  // Create a ZonedDateTime in UTC for consistency with the local-date branch,
  // then convert it to an Instant.
  return Temporal.ZonedDateTime.from({
    year,
    month,
    day,
    hour,
    minute,
    second,
    timeZone: "UTC",
  }).toInstant();
}

function parseFloatingDateTime(
  value: string,
  timeZone: string,
): Temporal.PlainDate | Temporal.ZonedDateTime {
  // Expect formats like 20231225 (date) or 20231225T120000 (datetime)
  const year = parseInt(value.slice(0, 4));
  const month = parseInt(value.slice(4, 6));
  const day = parseInt(value.slice(6, 8));

  if (value.length === 8) {
    return Temporal.PlainDate.from({ year, month, day });
  }

  const hour = parseInt(value.slice(9, 11));
  const minute = parseInt(value.slice(11, 13));
  const second = parseInt(value.slice(13, 15)) || 0;

  return Temporal.ZonedDateTime.from({
    year,
    month,
    day,
    hour,
    minute,
    second,
    timeZone,
  });
}

function parseTemporal(
  value: string,
  timeZone: string,
): Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant {
  if (value.endsWith("Z")) {
    return parseUTCDateTime(value);
  }

  return parseFloatingDateTime(value, timeZone);
}

const WEEKDAY_MAP: Record<string, Weekday> = {
  MO: "mo",
  TU: "tu",
  WE: "we",
  TH: "th",
  FR: "fr",
  SA: "sa",
  SU: "su",
};

const FREQUENCY_MAP: Record<string, Frequency> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

/**
 * Parses an RRULE string into a Recurrence object
 * @param rruleString - The RRULE string to parse (e.g., "RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR")
 * @returns Recurrence object matching the interface definition
 * @throws Error if the RRULE string is malformed or contains unsupported frequency
 */
export function fromRRule(rrule: string, timeZone: string = "UTC"): Recurrence {
  if (!rrule.startsWith("RRULE:")) {
    throw new Error('Invalid RRULE: must start with "RRULE:"');
  }

  // Remove "RRULE:" prefix and split by semicolon
  const ruleBody = rrule.substring(6);
  const parts = ruleBody.split(";");

  const recurrence: Partial<Recurrence> = {};

  for (const part of parts) {
    if (!part.includes("=")) continue;

    const [key, value] = part.split("=", 2);
    if (!key || !value) continue;

    switch (key.toUpperCase()) {
      case "FREQ": {
        const frequency = FREQUENCY_MAP[value.toUpperCase()];
        if (!frequency) {
          throw new Error(`Unsupported frequency: ${value}`);
        }
        recurrence.frequency = frequency;
        break;
      }

      case "INTERVAL": {
        const interval = parseInt(value);
        if (isNaN(interval) || interval < 1) {
          throw new Error(`Invalid interval: ${value}`);
        }
        recurrence.interval = interval;
        break;
      }

      case "COUNT": {
        const count = parseInt(value);
        if (isNaN(count) || count < 1) {
          throw new Error(`Invalid count: ${value}`);
        }
        recurrence.count = count;
        break;
      }

      case "UNTIL": {
        try {
          recurrence.until = parseTemporal(value, timeZone);
        } catch {
          throw new Error(`Invalid UNTIL date: ${value}`);
        }
        break;
      }

      case "BYDAY": {
        const weekdays = value.split(",").map((day) => {
          // Handle prefixed weekdays like "1MO", "-1FR" by extracting the weekday part
          const cleanDay = day.replace(/^[+-]?\d*/, "").toUpperCase();
          const mappedDay = WEEKDAY_MAP[cleanDay];
          if (!mappedDay) {
            throw new Error(`Invalid weekday: ${day}`);
          }
          return mappedDay;
        });
        recurrence.byDay = weekdays;
        break;
      }

      case "BYMONTH": {
        const months = value.split(",").map((month) => {
          const num = parseInt(month);
          if (isNaN(num) || num < 1 || num > 12) {
            throw new Error(`Invalid month: ${month}`);
          }
          return num;
        });
        recurrence.byMonth = months;
        break;
      }

      case "BYMONTHDAY": {
        const monthDays = value.split(",").map((day) => {
          const num = parseInt(day);
          if (isNaN(num) || num < 1 || num > 31) {
            throw new Error(`Invalid month day: ${day}`);
          }
          return num;
        });
        recurrence.byMonthDay = monthDays;
        break;
      }

      case "BYYEARDAY": {
        const yearDays = value.split(",").map((day) => {
          const num = parseInt(day);
          if (isNaN(num) || num < 1 || num > 366) {
            throw new Error(`Invalid year day: ${day}`);
          }
          return num;
        });
        recurrence.byYearDay = yearDays;
        break;
      }

      case "BYWEEKNO": {
        const weekNos = value.split(",").map((week) => {
          const num = parseInt(week);
          if (isNaN(num) || num < 1 || num > 53) {
            throw new Error(`Invalid week number: ${week}`);
          }
          return num;
        });
        recurrence.byWeekNo = weekNos;
        break;
      }

      case "BYHOUR": {
        const hours = value.split(",").map((hour) => {
          const num = parseInt(hour);
          if (isNaN(num) || num < 0 || num > 23) {
            throw new Error(`Invalid hour: ${hour}`);
          }
          return num;
        });
        recurrence.byHour = hours;
        break;
      }

      case "BYMINUTE": {
        const minutes = value.split(",").map((minute) => {
          const num = parseInt(minute);
          if (isNaN(num) || num < 0 || num > 59) {
            throw new Error(`Invalid minute: ${minute}`);
          }
          return num;
        });
        recurrence.byMinute = minutes;
        break;
      }

      case "BYSECOND": {
        const seconds = value.split(",").map((second) => {
          const num = parseInt(second);
          if (isNaN(num) || num < 0 || num > 59) {
            throw new Error(`Invalid second: ${second}`);
          }
          return num;
        });
        recurrence.bySecond = seconds;
        break;
      }

      default:
        // Ignore unsupported RRULE properties (like WKST, BYSETPOS, etc.)
        break;
    }
  }

  if (!recurrence.frequency) {
    throw new Error("RRULE must include FREQ parameter");
  }

  return recurrence as Recurrence;
}
