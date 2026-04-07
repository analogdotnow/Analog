import { UIMessage, tool } from "ai";
import * as z from "zod";

export const aiTools = {
  getTime: tool({
    description: "Get the current time in a specific timezone",
    inputSchema: z.object({
      timezone: z.string().trim().meta({
        description: "A valid IANA timezone, e.g. 'Europe/Paris'",
      }),
    }),
    execute: async ({ timezone }) => {
      try {
        const now = new Date();
        const time = now.toLocaleString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        return { time, timezone };
      } catch {
        return { error: "Invalid timezone format." };
      }
    },
  }),
  getCurrentDate: tool({
    description: "Get the current date and time with timezone information",
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();
      return {
        timestamp: now.getTime(),
        iso: now.toISOString(),
        local: now.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        utc: now.toUTCString(),
      };
    },
  }),
};

export type AITools = typeof aiTools;

export type ChatMessage = UIMessage<AITools>;
export type ChatMessagePart = ChatMessage["parts"][number];
