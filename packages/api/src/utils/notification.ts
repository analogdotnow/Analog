import "server-only";
import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@repo/db";
import {
  notification,
  notificationPushSubscription,
  notificationSource,
  notificationSourceEvent,
} from "@repo/db/schema";

import { notificationCreateRequest } from "../schemas/notification";
import { sendPushNotification } from "./push-notification";

export async function createAndSendNotification(
  input: z.infer<typeof notificationCreateRequest>,
  userId: string,
) {
  console.log("Creating and sending notification:", input, userId);
  const sourceQuery = await db
    .select()
    .from(notificationSource)
    .where(eq(notificationSource.slug, input.sourceId || "local"));

  if (sourceQuery.length <= 0) {
    throw new Error("Invalid source ID, please provide a valid source slug.");
  }

  const sourceEvent = await db
    .insert(notificationSourceEvent)
    .values({
      sourceId: sourceQuery[0]!.id,
      eventId: input.eventId,
    })
    .returning();

  const result = await db
    .insert(notification)
    .values({
      userId,
      message: input.body,
      type: input.type,
      sourceEvent: sourceEvent[0]!.id,
    })
    .returning();
  console.log("Notification created:", result);

  // Send the notification to the push subscription if it exists
  const pushSubscription = await db
    .select()
    .from(notificationPushSubscription)
    .where(eq(notificationPushSubscription.userId, userId));

  if (pushSubscription.length > 0) {
    // Send the notification to the push subscription
    console.log(
      "Sending push notifications to subscriptions:",
      pushSubscription,
    );
    const sendNotifications = pushSubscription.map((subscription) => {
      const payload = {
        title: input.title,
        body: input.body,
        data: {
          type: input.type,
          sourceId: input.sourceId,
          eventId: input.eventId,
        },
      };

      return sendPushNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        payload,
      );
    });
    const results = await Promise.all(sendNotifications);
    if (results.some((res) => res.statusCode !== 201)) {
      console.error("Failed to send some push notifications:", results);
    }
    console.log("Push notifications sent successfully.");
  }
  return { success: !!result, data: result[0] || null };
}
