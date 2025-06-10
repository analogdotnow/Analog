import { Temporal } from "temporal-polyfill";

type ToDateOptions =
  | {
      value: Temporal.ZonedDateTime;
      timeZone: string;
    }
  | {
      value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
      timeZone: string;
    };

export function toDate({ value, timeZone }: ToDateOptions): Date {
  return new Date(toInstant({ value, timeZone }).toString());
}

interface ToInstantOptions {
  value: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
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

export function compareTemporal(
  a: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
  b: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime,
) {
  return Temporal.Instant.compare(
    toInstant({ value: a, timeZone: "UTC" }),
    toInstant({ value: b, timeZone: "UTC" }),
  );
}
