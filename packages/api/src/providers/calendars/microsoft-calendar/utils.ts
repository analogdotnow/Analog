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
