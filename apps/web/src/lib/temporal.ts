import { Temporal } from "temporal-polyfill";

export type TemporalDate =
  | Temporal.PlainDate
  | Temporal.Instant
  | Temporal.ZonedDateTime;

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

export function sortTemporal(
  values: (Temporal.Instant | Temporal.ZonedDateTime | Temporal.PlainDate)[],
) {
  return values
    .map((v) => [v, toInstant({ value: v, timeZone: "UTC" })] as const)
    .sort(([, i1], [, i2]) => Temporal.Instant.compare(i1, i2))
    .map(([v]) => v);
}

export function sortDate(values: Temporal.PlainDate[]) {
  return values.sort((d1, d2) => Temporal.PlainDate.compare(d1, d2));
}
