import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

import { env } from "@repo/env/server";
import { db } from "@repo/db";
import { notificationEvent, pushSubscription } from "@repo/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:notifications@analog.com",
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Get unsent notifications that are due within the next 5 minutes
    const dueNotifications = await db
      .select()
      .from(notificationEvent)
      .where(
        and(
          eq(notificationEvent.sent, false),
          gte(notificationEvent.reminderTime, now),
          lte(notificationEvent.reminderTime, fiveMinutesFromNow)
        )
      );

    if (dueNotifications.length === 0) {
      return NextResponse.json({ 
        message: "No notifications due", 
        count: 0 
      });
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Process each notification
    for (const notification of dueNotifications) {
      try {
        // Get user's push subscriptions
        const subscriptions = await db
          .select()
          .from(pushSubscription)
          .where(eq(pushSubscription.userId, notification.userId));

        if (subscriptions.length === 0) {
          // Mark as sent even if no subscriptions (to avoid retrying)
          await db
            .update(notificationEvent)
            .set({ sent: true, updatedAt: new Date() })
            .where(eq(notificationEvent.id, notification.id));
          continue;
        }

        // Send to all user's subscriptions
        const pushPromises = subscriptions.map(async (subscription) => {
          try {
            const payload = JSON.stringify({
              title: notification.title,
              body: notification.body || "You have a reminder",
              tag: `reminder-${notification.id}`,
              data: {
                notificationId: notification.id,
                type: "reminder",
              },
            });

            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth,
                },
              },
              payload
            );
          } catch (error) {
            console.error(`Failed to send to subscription ${subscription.id}:`, error);
            
            // If subscription is invalid, remove it
            if (error instanceof webpush.WebPushError && error.statusCode === 410) {
              await db
                .delete(pushSubscription)
                .where(eq(pushSubscription.id, subscription.id));
            }
          }
        });

        await Promise.allSettled(pushPromises);

        // Mark notification as sent
        await db
          .update(notificationEvent)
          .set({ sent: true, updatedAt: new Date() })
          .where(eq(notificationEvent.id, notification.id));

        sentCount++;
      } catch (error) {
        console.error(`Failed to process notification ${notification.id}:`, error);
        errors.push(`Notification ${notification.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: "Notifications processed",
      sent: sentCount,
      total: dueNotifications.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 