import { format } from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

export interface FormatTimeOptions {
  value: Temporal.ZonedDateTime;
  use12Hour: boolean;
  locale: string;
}

export function formatTime({ value, use12Hour, locale }: FormatTimeOptions) {
  const date = toDate({ value, timeZone: value.timeZoneId });

  if (use12Hour) {
    return format({
      date,
      format: "hh:mm a",
      locale,
      tz: value.timeZoneId,
    });
  }

  return format({
    date,
    format: "HH:mm",
    locale,
    tz: value.timeZoneId,
  });
}
