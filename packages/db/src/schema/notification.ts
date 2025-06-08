import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { type PushSubscription } from "web-push";

import { user } from "./auth";

export const notificationTypeEnum = pgEnum("notification_type", [
  "reminder",
  "event_update",
  "event_cancellation",
  "custom",
  "system_alert",
  "user_message",
  "task_reminder",
  "task_update",
  "task_assignment",
  "task_completion",
  "task_cancellation",
  "task_overdue",
  "task_priority_change",
  "task_comment",
]);

export const notification = pgTable("notification", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  sourceEvent: uuid()
    .notNull()
    .references(() => notificationSourceEvent.id, {
      onDelete: "cascade",
    }), // Reference to the notification source
  message: text().notNull(),
  scheduledAt: timestamp({
    mode: "date",
    withTimezone: true,
  }), // When the notification should be shown
  readAt: timestamp({
    mode: "date",
    withTimezone: true,
  }), // When the notification was read, null if not read
  createdAt: timestamp({
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const notificationSource = pgTable("notification_source", {
  id: uuid().primaryKey().defaultRandom(),
  slug: text().notNull().unique(), // Unique identifier for the source, e.g., 'google-calendar', 'microsoft-outlook'
  name: text().notNull(), // e.g., 'Google Calendar', 'Microsoft Outlook'
  description: text().notNull(), // Description of the source
  createdAt: timestamp({
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const notificationSourceEvent = pgTable("notification_source_event", {
  id: uuid().primaryKey().defaultRandom(),
  sourceId: uuid()
    .notNull()
    .references(() => notificationSource.id, { onDelete: "cascade" }),
  eventId: text(), // ID of the event in the external source
  createdAt: timestamp({
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const notificationPushSubscription = pgTable(
  "notification_push_subscription",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text().notNull(), // URL to send the push notification to
    keyAuth: text().notNull(), // Authentication key for the push subscription
    keyP256dh: text().notNull(), // P256DH public key for the push subscription
    expirationTime: timestamp({
      mode: "date",
      withTimezone: true,
    }), // Optional expiration time for the subscription
    createdAt: timestamp({
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
);
