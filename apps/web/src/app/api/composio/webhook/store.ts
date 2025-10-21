import { env } from "@repo/env/server";

import type { GmailTriggerEvent } from "./schema";

const GMAIL_EVENTS_KEY = "composio:gmail:events";
const MAX_STORED_EVENTS = 200;

async function pushToRedis(payload: unknown) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return;
  }

  const commands: [string, ...unknown[]][] = [
    ["LPUSH", GMAIL_EVENTS_KEY, JSON.stringify(payload)],
    ["LTRIM", GMAIL_EVENTS_KEY, "0", String(MAX_STORED_EVENTS - 1)],
  ];

  const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    console.error(
      "Failed to persist Gmail trigger event",
      await response.text(),
    );
  }
}

export async function storeGmailTriggerEvent(event: GmailTriggerEvent) {
  try {
    await pushToRedis({
      ...event,
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error storing Gmail trigger event", error);
  }
}
