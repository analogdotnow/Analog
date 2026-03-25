import { Temporal } from "temporal-polyfill";

import { mapWindowsToIanaTimeZone } from "./windows-timezones";

export function isValidTimeZone(timeZone: string) {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    throw new Error("Time zones are not available in this environment");
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function parseTimeZone(timeZone: string) {
  if (isValidTimeZone(timeZone)) {
    return timeZone;
  }

  return mapWindowsToIanaTimeZone(timeZone);
}

export function parseDateTime(dateTime: string, timeZone: string) {
  return Temporal.PlainDateTime.from(dateTime).toZonedDateTime(
    parseTimeZone(timeZone) ?? "UTC",
  );
}

export function calendarPath(calendarId: string) {
  return calendarId === "primary"
    ? "/me/calendar"
    : `/me/calendars/${calendarId}`;
}

interface ToMicrosoftDateOptions {
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
  originalTimeZone?: {
    raw: string;
    parsed?: string;
  };
}

export function toMicrosoftDate({
  value,
  originalTimeZone,
}: ToMicrosoftDateOptions) {
  if (value instanceof Temporal.PlainDate) {
    return {
      dateTime: value.toString(),
      timeZone: originalTimeZone?.raw ?? "UTC",
    };
  }

  // These events were created using another provider.
  if (value instanceof Temporal.Instant) {
    const dateTime = value
      .toZonedDateTimeISO("UTC")
      .toPlainDateTime()
      .toString();

    return {
      dateTime,
      timeZone: "UTC",
    };
  }

  return {
    dateTime: value.toInstant().toString(),
    timeZone:
      originalTimeZone?.parsed === value.timeZoneId
        ? originalTimeZone?.raw
        : value.timeZoneId,
  };
}
