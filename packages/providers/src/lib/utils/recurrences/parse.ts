import { Temporal } from "temporal-polyfill";

import type { Frequency, Recurrence, Weekday } from "../../../interfaces";

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
  MO: "MO",
  TU: "TU",
  WE: "WE",
  TH: "TH",
  FR: "FR",
  SA: "SA",
  SU: "SU",
};

const FREQUENCY_MAP: Record<string, Frequency> = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
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
        const freq = FREQUENCY_MAP[value.toUpperCase()];
        if (!freq) {
          throw new Error(`Unsupported freq ${value}`);
        }
        recurrence.freq = freq;
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

      case "BYSETPOS": {
        const setPositions = value.split(",").map((pos) => {
          const num = parseInt(pos);
          if (isNaN(num) || num === 0 || num < -366 || num > 366) {
            throw new Error(`Invalid set position: ${pos}`);
          }
          return num;
        });
        recurrence.bySetPos = setPositions;
        break;
      }

      case "WKST": {
        const weekStart = WEEKDAY_MAP[value.toUpperCase()];
        if (!weekStart) {
          throw new Error(`Invalid week start: ${value}`);
        }
        recurrence.wkst = weekStart;
        break;
      }

      default:
        // Ignore unsupported RRULE properties
        break;
    }
  }

  if (!recurrence.freq) {
    throw new Error("RRULE must include FREQ parameter");
  }

  return recurrence as Recurrence;
}

/**
 * Parses an RDATE string into an array of dates
 * @param rDateString - The RDATE string to parse (e.g., "RDATE:20231225T120000Z,20231226T120000Z")
 * @param timeZone - Time zone for parsing floating dates
 * @returns Array of Temporal date objects
 * @throws Error if the RDATE string is malformed
 */
export function fromRDate(
  rDateString: string,
  timeZone: string = "UTC",
): (Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant)[] {
  if (!rDateString.startsWith("RDATE:")) {
    throw new Error('Invalid RDATE: must start with "RDATE:"');
  }

  // Remove "RDATE:" prefix and split by comma
  const dateBody = rDateString.substring(6);
  if (!dateBody.trim()) {
    return [];
  }

  const dateStrings = dateBody.split(",");
  const dates: (
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
  )[] = [];

  for (const dateString of dateStrings) {
    try {
      const parsed = parseTemporal(dateString.trim(), timeZone);
      dates.push(parsed);
    } catch {
      throw new Error(`Invalid RDATE date: ${dateString}`);
    }
  }

  return dates;
}

/**
 * Parses an EXDATE string into an array of dates
 * @param exDateString - The EXDATE string to parse (e.g., "EXDATE:20231225T120000Z,20231226T120000Z")
 * @param timeZone - Time zone for parsing floating dates
 * @returns Array of Temporal date objects
 * @throws Error if the EXDATE string is malformed
 */
export function fromExDate(
  exDateString: string,
  timeZone: string = "UTC",
): (Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant)[] {
  if (!exDateString.startsWith("EXDATE:")) {
    throw new Error('Invalid EXDATE: must start with "EXDATE:"');
  }

  // Remove "EXDATE:" prefix and split by comma
  const dateBody = exDateString.substring(7);
  if (!dateBody.trim()) {
    return [];
  }

  const dateStrings = dateBody.split(",");
  const dates: (
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
  )[] = [];

  for (const dateString of dateStrings) {
    try {
      const parsed = parseTemporal(dateString.trim(), timeZone);
      dates.push(parsed);
    } catch {
      throw new Error(`Invalid EXDATE date: ${dateString}`);
    }
  }

  return dates;
}

/**
 * Parses a complete recurrence specification from multiple iCalendar properties
 * @param properties - Array of iCalendar property strings (RRULE, RDATE, EXDATE)
 * @param timeZone - Time zone for parsing floating dates
 * @returns Complete Recurrence object
 * @throws Error if no RRULE is found or if any property is malformed
 */
export function fromRecurrenceProperties(
  properties: string[],
  timeZone: string = "UTC",
): Recurrence {
  let recurrence: Recurrence | null = null;
  const rDates: (
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
  )[] = [];
  const exDates: (
    | Temporal.PlainDate
    | Temporal.ZonedDateTime
    | Temporal.Instant
  )[] = [];

  for (const property of properties) {
    const trimmed = property.trim();

    if (trimmed.startsWith("RRULE:")) {
      if (recurrence) {
        throw new Error("Multiple RRULE properties are not allowed");
      }
      recurrence = fromRRule(trimmed, timeZone);
    } else if (trimmed.startsWith("RDATE:")) {
      const dates = fromRDate(trimmed, timeZone);
      rDates.push(...dates);
    } else if (trimmed.startsWith("EXDATE:")) {
      const dates = fromExDate(trimmed, timeZone);
      exDates.push(...dates);
    }
  }

  if (!recurrence) {
    throw new Error("RRULE property is required");
  }

  // Add RDATE and EXDATE arrays to the recurrence if they exist
  if (rDates.length > 0) {
    recurrence.rDate = rDates;
  }
  if (exDates.length > 0) {
    recurrence.exDate = exDates;
  }

  return recurrence;
}
