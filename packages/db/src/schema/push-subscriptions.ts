import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const pushSubscription = pgTable(
  "push_subscription",
  {
    id: text().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text().notNull(),
    keys: jsonb().notNull().$type<{
      p256dh: string;
      auth: string;
    }>(),
    expirationTime: timestamp(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (table) => [
    index("push_subscription_user_id_idx").on(table.userId),
    index("push_subscription_endpoint_idx").on(table.endpoint),
    unique("push_subscription_user_endpoint_unique").on(
      table.userId,
      table.endpoint,
    ),
  ],
);

export const pushSubscriptionRelations = relations(
  pushSubscription,
  ({ one }) => ({
    user: one(user, {
      fields: [pushSubscription.userId],
      references: [user.id],
    }),
  }),
);
