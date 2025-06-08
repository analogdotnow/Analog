import { notificationPushSubscription } from "../schema";

export type PushSubscriptionPayload = Omit<
  typeof notificationPushSubscription.$inferSelect,
  "id" | "createdAt"
>;
