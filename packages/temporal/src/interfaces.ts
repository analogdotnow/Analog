import { Temporal } from "temporal-polyfill";

export type TemporalConvertible =
  | Temporal.ZonedDateTime
  | Temporal.PlainDate
  | Temporal.Instant;
