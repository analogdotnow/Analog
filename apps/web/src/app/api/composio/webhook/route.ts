import { NextRequest } from "next/server";

import { parseIncomingTrigger } from "./schema";
import { storeGmailTriggerEvent } from "./store";
import { TriggerEvent } from "@composio/core";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const result = parseIncomingTrigger(payload);

  if (!result.success) {
    return new Response("Invalid trigger payload", { status: 400 });
  }

  const event = result.data;

  if (event.toolkitSlug === "gmail") {
    await storeGmailTriggerEvent(event);
  }

  return Response.json({ received: true });
}
