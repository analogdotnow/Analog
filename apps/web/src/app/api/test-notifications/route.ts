import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

import { env } from "@repo/env/server";
import { db } from "@repo/db";
import { pushSubscription } from "@repo/db/schema";
import { eq } from "drizzle-orm";

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:notifications@analog.com",
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { userId, title = "Test Notification", body = "This is a test notification" } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get user's push subscriptions
    const subscriptions = await db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, userId));

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: "No push subscriptions found for user" }, { status: 404 });
    }

    const payload = JSON.stringify({
      title,
      body,
      tag: `test-notification-${Date.now()}`,
      data: {
        type: "test",
        timestamp: new Date().toISOString(),
      },
    });

    // Send to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
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
          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          console.error(`Failed to send to subscription ${subscription.id}:`, error);
          
          // If subscription is invalid, remove it
          if (error instanceof webpush.WebPushError && error.statusCode === 410) {
            await db
              .delete(pushSubscription)
              .where(eq(pushSubscription.id, subscription.id));
          }
          
          return { success: false, subscriptionId: subscription.id, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      message: "Test notification sent",
      total: subscriptions.length,
      successful,
      failed,
      results: results.map(result => result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }),
    });
  } catch (error) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 