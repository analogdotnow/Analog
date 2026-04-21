import { createOpenAI } from "@ai-sdk/openai";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText } from "ai";

import { env } from "@repo/env/tanstack/server";

import { ChatMessage, aiTools } from "@/lib/ai-tools";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface ThreadRequest {
  messages: ChatMessage[];
}

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: ThreadRequest = await request.json();

        const result = streamText({
          model: openai("gpt-5-mini"),
          system:
            "You are a helpful assistant with access to tools. Use the getCurrentDate tool when users ask about dates, time, or current information. You are also able to use the getTime tool to get the current time in a specific timezone.",
          messages: await convertToModelMessages(messages),
          stopWhen: stepCountIs(5),
          tools: aiTools,
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});
