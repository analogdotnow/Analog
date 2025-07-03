import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { newId } from "../lib/id";
import { account } from "./auth";
import { resource } from "./resource";

export const channel = pgTable("channel", {
  id: text()
    .primaryKey()
    .$default(() => newId("channel")),

  // TODO: when an account is deleted, we should first stop channel subscriptions and then delete all channels associated with it
  accountId: text()
    .notNull()
    .references(() => account.id, { onDelete: "cascade" }),
  providerId: text({ enum: ["google"] }).notNull(),
  resourceId: text()
    .notNull()
    .references(() => resource.id, { onDelete: "cascade" }),

  type: text({ enum: ["google.calendar", "google.event"] }).notNull(),

  token: text().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
