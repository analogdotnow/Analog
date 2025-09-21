import * as Tempo from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

interface FormatTimeOptions {
  value: Temporal.ZonedDateTime | Temporal.PlainTime;
  use12Hour: boolean;
  locale?: string;
  timeZone?: string;
}

export function formatTime({
  value,
  use12Hour,
  locale,
  timeZone,
}: FormatTimeOptions) {
  if (value instanceof Temporal.PlainTime) {
    const date = Temporal.Now.plainDateISO();
    const dateTime = date.toZonedDateTime({
      timeZone: "UTC",
      plainTime: value,
    });

    return Tempo.format({
      date: toDate(dateTime),
      format: "HH:mm",
      locale,
      tz: "UTC",
    });
  }

  const date = toDate(value, { timeZone: timeZone ?? value.timeZoneId });

  if (use12Hour) {
    return Tempo.format({
      date,
      format: "h:mm a",
      locale,
      tz: value.timeZoneId,
    });
  }

  return Tempo.format({
    date,
    format: "HH:mm",
    locale,
    tz: value.timeZoneId,
  });
}

export function format(
  value: Temporal.ZonedDateTime,
  format: Tempo.Format,
  locale: string,
  timeZone?: string,
) {
  return Tempo.format({
    date: toDate(value, { timeZone: timeZone ?? value.timeZoneId }),
    format,
    locale,
    tz: timeZone ?? value.timeZoneId,
  });
}
