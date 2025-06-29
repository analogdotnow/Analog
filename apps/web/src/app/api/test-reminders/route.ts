import { NextRequest, NextResponse } from "next/server";

import { db } from "@repo/db";
import { notificationEvent } from "@repo/db/schema";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { userId, title = "Test Reminder", body = "This is a test reminder", minutesFromNow = 1 } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const reminderTime = new Date(Date.now() + minutesFromNow * 60 * 1000);

    const reminder = await db
      .insert(notificationEvent)
      .values({
        id: nanoid(),
        userId,
        title,
        body,
        reminderTime,
      })
      .returning();

    return NextResponse.json({
      message: "Test reminder created",
      reminder: reminder[0],
      reminderTime: reminderTime.toISOString(),
    });
  } catch (error) {
    console.error("Test reminder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 