import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getCalendarProviders } from "@repo/api/utils/context";
import { auth } from "@repo/auth/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const providers = await getCalendarProviders(session.user, req.headers);

  const metadata: string[] = [];
  
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return result.toTextStreamResponse();
}
