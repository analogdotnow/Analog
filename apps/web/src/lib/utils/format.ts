import * as Tempo from "@formkit/tempo";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

interface FormatTimeOptions {
  value: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainTime;
  use12Hour: boolean;
  locale?: string;
  timeZone: string;
}

export function formatTime(options: FormatTimeOptions): string;
export function formatTime(
  value: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainTime,
  use12Hour: boolean,
  timeZone?: string,
  locale?: string,
): string;
export function formatTime(
  value:
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | Temporal.PlainTime
    | FormatTimeOptions,
  use12Hour?: boolean,
  timeZone?: string,
  locale?: string,
) {
  if (value instanceof Temporal.PlainTime) {
    const date = Temporal.Now.plainDateISO();
    const dateTime = date.toZonedDateTime({
      timeZone: timeZone ?? "UTC",
      plainTime: value,
    });

    return Tempo.format({
      date: toDate(dateTime),
      format: use12Hour ? "h:mm a" : "HH:mm",
      locale,
      tz: timeZone ?? "UTC",
    });
  }

  if (value instanceof Temporal.Instant) {
    return Tempo.format({
      date: toDate(value, { timeZone: timeZone! }),
      format: use12Hour ? "h:mm a" : "HH:mm",
      locale,
      tz: timeZone ?? "UTC",
    });
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return Tempo.format({
      date: toDate(value, { timeZone: value.timeZoneId }),
      format: use12Hour ? "h:mm a" : "HH:mm",
      locale,
      tz: value.timeZoneId,
    });
  }

  if (value.value instanceof Temporal.PlainTime) {
    const date = Temporal.Now.plainDateISO();
    const dateTime = date.toZonedDateTime({
      timeZone: value.timeZone ?? "UTC",
      plainTime: value.value,
    });

    return Tempo.format({
      date: toDate(dateTime),
      format: value.use12Hour ? "h:mm a" : "HH:mm",
      locale: value.locale,
      tz: value.timeZone ?? "UTC",
    });
  }

  if (value.value instanceof Temporal.Instant) {
    return Tempo.format({
      date: toDate(value.value, { timeZone: value.timeZone! }),
      format: value.use12Hour ? "h:mm a" : "HH:mm",
      locale: value.locale,
      tz: value.timeZone!,
    });
  }

  return Tempo.format({
    date: toDate(value.value, {
      timeZone: value.timeZone ?? value.value.timeZoneId,
    }),
    format: value.use12Hour ? "h:mm a" : "HH:mm",
    locale: value.locale,
    tz: value.timeZone ?? value.value.timeZoneId,
  });
}

type FormatOptions =
  | {
      value: Temporal.ZonedDateTime;
      format: Tempo.Format;
      timeZone?: string;
      locale?: string;
    }
  | {
      value: Temporal.Instant;
      format: Tempo.Format;
      timeZone: string;
      locale?: string;
    }
  | {
      value: Temporal.PlainDate;
      format: Tempo.Format;
      timeZone: string;
      locale?: string;
    };

export function format(options: FormatOptions): string;
export function format(
  value: Temporal.ZonedDateTime,
  format: Tempo.Format,
  timeZone?: string,
  locale?: string,
): string;
export function format(
  value: Temporal.Instant,
  format: Tempo.Format,
  timeZone: string,
  locale?: string,
): string;
export function format(
  value: Temporal.PlainDate,
  format: Tempo.Format,
  timeZone: string,
  locale?: string,
): string;
export function format(
  value:
    | Temporal.ZonedDateTime
    | Temporal.Instant
    | Temporal.PlainDate
    | FormatOptions,
  format?: Tempo.Format,
  timeZone?: string,
  locale?: string,
) {
  if (value instanceof Temporal.Instant) {
    return Tempo.format({
      date: toDate(value, { timeZone: timeZone! }),
      format: format!,
      locale,
      tz: timeZone!,
    });
  }

  if (value instanceof Temporal.PlainDate) {
    return Tempo.format({
      date: toDate(value, { timeZone: timeZone! }),
      format: format!,
      locale,
      tz: timeZone!,
    });
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return Tempo.format({
      date: toDate(value, { timeZone: timeZone ?? value.timeZoneId }),
      format: format!,
      locale,
      tz: timeZone ?? value.timeZoneId,
    });
  }

  if (value.value instanceof Temporal.Instant) {
    return Tempo.format({
      date: toDate(value.value, { timeZone: value.timeZone! }),
      format: value.format,
      locale: value.locale,
      tz: value.timeZone!,
    });
  }

  if (value.value instanceof Temporal.PlainDate) {
    return Tempo.format({
      date: toDate(value.value, { timeZone: value.timeZone! }),
      format: value.format,
      locale: value.locale,
      tz: value.timeZone!,
    });
  }

  return Tempo.format({
    date: toDate(value.value, {
      timeZone: value.timeZone ?? value.value.timeZoneId,
    }),
    format: value.format,
    locale: value.locale,
    tz: value.timeZone ?? value.value.timeZoneId,
  });
}
