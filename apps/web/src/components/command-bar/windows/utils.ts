import { Temporal } from "temporal-polyfill";

import { toPlainDate } from "@repo/temporal";

export function isPhysicalLocation(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    new URL(value);
  } catch {
    return true;
  }

  return false;
}

export function startsWithinDays(
  start:
    | Temporal.PlainDate
    | Temporal.Instant
    | Temporal.ZonedDateTime
    | undefined,
  days: number,
): boolean {
  if (!start) {
    return false;
  }

  const now = Temporal.Now.zonedDateTimeISO();

  const startDate = toPlainDate(start, {
    timeZone: now.timeZoneId,
  });

  const today = now.toPlainDate();
  const daysUntilStart = today.until(startDate, { largestUnit: "days" }).days;

  return daysUntilStart >= 0 && daysUntilStart < days;
}
