import {
  bigint,
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { instant, temporal } from "@/lib/drizzle/utils/temporal";
import type { Attendee, Conference, Recurrence } from "@/lib/interfaces";
import { calendars } from "./calendars";

export const events = pgTable(
  "event",
  {
    id: text("id").notNull(),
    start: temporal("start").notNull(),
    end: temporal("end").notNull(),
    calendarId: text("calendar_id").notNull(),
    providerId: text("provider_id", {
      enum: ["google", "microsoft"],
    }).notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    recurringEventId: text("recurring_event_id"),
    readOnly: boolean("read_only").default(false).notNull(),
    visibility: text("visibility", {
      enum: ["default", "public", "private", "confidential"],
    }),
    availability: text("availability", {
      enum: ["busy", "free"],
    }),
    status: text("status", {
      enum: ["confirmed", "tentative", "cancelled"],
    }),
    etag: text("etag"),
    title: text("title"),
    description: text("description"),
    location: text("location"),
    url: text("url"),
    color: text("color"),
    allDay: boolean("all_day"),
    createdAt: instant("created_at"),
    updatedAt: instant("updated_at"),
    responseStatus: text("response_status", {
      enum: ["accepted", "tentative", "declined", "unknown"],
    }),
    attendees: jsonb("attendees").$type<Attendee[]>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    conference: jsonb("conference").$type<Conference>(),
    recurrence: jsonb("recurrence").$type<Recurrence>(),

    startInstant: timestamp("start_instant", { withTimezone: true }).notNull(),
    endInstant: timestamp("end_instant", { withTimezone: true }).notNull(),
    // raw: jsonb("raw").$type<Record<string, unknown>>().notNull(),
  },
  (table) => [
    primaryKey({
      name: "event_pk",
      columns: [table.providerAccountId, table.calendarId, table.id],
    }),
    foreignKey({
      name: "event_calendar_fk",
      columns: [table.providerAccountId, table.calendarId],
      foreignColumns: [calendars.accountId, calendars.id],
    }),
    index("event_calendar_start_idx").on(table.calendarId, table.startInstant),
    index("event_account_start_idx").on(
      table.providerAccountId,
      table.startInstant,
    ),
    index("event_provider_calendar_idx").on(table.providerId, table.calendarId),
    index("event_provider_account_idx").on(
      table.providerId,
      table.providerAccountId,
    ),
    index("event_start_end_idx").on(table.startInstant, table.endInstant),
    index("event_response_status_idx").on(table.responseStatus),
  ],
);
