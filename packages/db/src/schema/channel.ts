import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { newId } from "../lib/id";
import { account } from "./auth";
import { resource } from "./resource";

export const channel = pgTable(
  "channel",
  {
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
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("channel_account_idx").on(table.accountId),
    index("channel_resource_idx").on(table.resourceId),
    index("channel_account_resource_idx").on(table.accountId, table.resourceId),
    index("channel_expires_at_idx").on(table.expiresAt),
    uniqueIndex("channel_token_unique").on(table.token),
  ],
);
