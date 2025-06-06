import { Temporal } from "temporal-polyfill";

interface ToDateOptions {
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function toDate({ value, timeZone }: ToDateOptions): Date {
  return new Date(toInstant({ value, timeZone }).toString());
}

interface ToInstantOptions {
  value: Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate;
  timeZone: string;
}

export function toInstant({ value, timeZone }: ToInstantOptions) {
  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO(timeZone).toInstant();
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return value.withTimeZone(timeZone).toInstant();
  }

  return value.toZonedDateTime(timeZone).toInstant();
}
