import {
  bigint,
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

import { calendars } from "./calendars";

export const events = pgTable(
  "event",
  {
    id: text("event_id").notNull(),
    start: jsonb("start").notNull(),
    end: jsonb("end").notNull(),
    raw: jsonb("raw").notNull(),
    calendarId: text("calendar_id").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id", {
      enum: ["google", "microsoft"],
    }).notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    recurringEventId: text("recurring_event_id"),
    readOnly: boolean("read_only").default(false).notNull(),
    visibility: text("visibility"),
    availability: text("availability"),
    status: text("status"),
    etag: text("etag"),
    title: text("title"),
    location: text("location"),
    url: text("url"),
    color: text("color"),
    createdAt: jsonb("created_at"),
    updatedAt: jsonb("updated_at"),
    startUnix: bigint("start_unix", { mode: "number" }).notNull(),
    endUnix: bigint("end_unix", { mode: "number" }).notNull(),
    responseStatus: text("response_status"),
  },
  (table) => [
    primaryKey({
      name: "event_pk",
      columns: [table.accountId, table.calendarId, table.id],
    }),
    foreignKey({
      name: "event_calendar_fk",
      columns: [table.accountId, table.calendarId],
      foreignColumns: [calendars.accountId, calendars.id],
    }),
    index("event_calendar_start_idx").on(table.calendarId, table.startUnix),
    index("event_account_start_idx").on(table.accountId, table.startUnix),
    index("event_provider_calendar_idx").on(table.providerId, table.calendarId),
    index("event_provider_account_idx").on(table.providerId, table.accountId),
    index("event_start_end_idx").on(table.startUnix, table.endUnix),
    index("event_response_status_idx").on(table.responseStatus),
  ],
);
