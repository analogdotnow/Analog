import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { newId } from "../lib/id";

export const calendar = pgTable("calendar", {
  id: text()
    .primaryKey()
    .$default(() => newId("calendar")),
  providerId: text({ enum: ["google", "microsoft"] }).notNull(),
  connectionId: text().notNull(),
  // .references(() => connection.id, { onDelete: "cascade" }),

  name: text().notNull(),
  description: text(),

  owner: text().notNull(),

  access: text({ enum: ["owner", "write", "read", "availability"] }).notNull(),

  timeZone: text(),

  enabled: boolean().notNull().default(true),

  syncToken: text(),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
