import { SQL } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";
import type { SuperJSONResult } from "superjson";
import { Temporal } from "temporal-polyfill";

import { superjson } from "./superjson";

export const instant = (name: string) =>
  customType<{ data: Temporal.Instant; driverData: string }>({
    dataType() {
      return "text";
    },
    fromDriver: (val: string) => Temporal.Instant.from(val),
    toDriver: (val: Temporal.Instant | SQL) =>
      val instanceof SQL ? val : val.toString(),
  })(name);

export const plainDate = (name: string) =>
  customType<{ data: Temporal.PlainDate; driverData: string }>({
    dataType() {
      return "text";
    },
    fromDriver: (val: string) => Temporal.PlainDate.from(val),
    toDriver: (val: Temporal.PlainDate | SQL) =>
      val instanceof SQL ? val : val.toString(),
  })(name);

export const zonedDateTime = (name: string) =>
  customType<{ data: Temporal.ZonedDateTime; driverData: string }>({
    dataType() {
      return "text";
    },
    fromDriver: (val: string) => Temporal.ZonedDateTime.from(val),
    toDriver: (val: Temporal.ZonedDateTime | SQL) =>
      val instanceof SQL ? val : val.toString(),
  })(name);

export const temporal = (name: string) =>
  customType<{
    data: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime;
    driverData: SuperJSONResult;
  }>({
    dataType() {
      return "jsonb";
    },
    fromDriver: (val: SuperJSONResult) =>
      superjson.deserialize(val) as
        | Temporal.PlainDate
        | Temporal.Instant
        | Temporal.ZonedDateTime,
    toDriver: (
      val: Temporal.PlainDate | Temporal.Instant | Temporal.ZonedDateTime | SQL,
    ) => (val instanceof SQL ? val : superjson.serialize(val)),
  })(name);
