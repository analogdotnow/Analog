import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const pushSubscription = pgTable("push_subscription", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  endpoint: text().notNull(),
  p256dh: text().notNull(),
  auth: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
}); 