import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { newId } from "../lib/id";
import { resource } from "./resource";

export const channel = pgTable("channel", {
  id: text().primaryKey().$default(() => newId("channel")),

  providerId: text({ enum: ["google"] }).notNull(),
  resourceId: text()
    .notNull()
    .references(() => resource.id, { onDelete: "cascade" }),

  token: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
 
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});
