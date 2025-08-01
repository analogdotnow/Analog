import { UIMessage, convertToModelMessages, streamText } from "ai";

import { getCalendarProviders } from "@repo/api/utils/context";
import { auth } from "@repo/auth/server";

import { openRouter } from "./provider";

export const maxDuration = 30;

interface ChatRequest {
  messages: UIMessage[];
}

export async function POST(req: Request) {
  const data: ChatRequest = await req.json();

  console.log(JSON.stringify(data, null, 2));

  const { messages } = data;

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // const providers = await getCalendarProviders(session.user, req.headers);

  // const metadata: string[] = [];

  const result = streamText({
    model: openRouter("moonshotai/kimi-k2:free"),
    messages: convertToModelMessages(messages),
  });

  return result.toTextStreamResponse();
}
