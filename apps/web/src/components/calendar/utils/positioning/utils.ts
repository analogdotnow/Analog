import { Temporal } from "temporal-polyfill";

import { endOfDay, isSameDay, startOfDay } from "@repo/temporal";

export function clampToStartOfDay(
  value: Temporal.ZonedDateTime,
  day: Temporal.PlainDate,
) {
  if (isSameDay(day, value, { timeZone: value.timeZoneId })) {
    return value;
  }

  return startOfDay(day, { timeZone: value.timeZoneId });
}

export function clampToEndOfDay(
  value: Temporal.ZonedDateTime,
  day: Temporal.PlainDate,
) {
  if (isSameDay(day, value, { timeZone: value.timeZoneId })) {
    return value;
  }

  return endOfDay(day, { timeZone: value.timeZoneId });
}
