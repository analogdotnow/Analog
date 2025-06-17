import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { account } from "./auth";

export const calendar = pgTable("calendar", {
  id: text().primaryKey(),
  providerId: text({ enum: ["google", "microsoft"] }).notNull(),
  name: text().notNull(),
  description: text(),
  timeZone: text(),
  primary: boolean().notNull().default(false),
  accountId: text()
    .notNull()
    .references(() => account.id, { onDelete: "cascade" }),
  color: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const event = pgTable("event", {
  id: text().primaryKey(),
  title: text().notNull().default(""),
  description: text(),
  start: timestamp({ withTimezone: true }).notNull(),
  end: timestamp({ withTimezone: true }).notNull(),
  allDay: boolean().notNull().default(false),
  location: text(),
  status: text(),
  url: text(),
  color: text(),
  providerId: text({ enum: ["google", "microsoft"] }).notNull(),
  accountId: text()
    .notNull()
    .references(() => account.id, { onDelete: "cascade" }),
  calendarId: text()
    .notNull()
    .references(() => calendar.id, { onDelete: "cascade" }),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
