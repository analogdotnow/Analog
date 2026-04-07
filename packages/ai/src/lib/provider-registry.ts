import { createCerebras } from "@ai-sdk/cerebras";
import { createOpenAI } from "@ai-sdk/openai";
import { createProviderRegistry } from "ai";

import { env } from "@repo/env/tanstack/server";

export const registry = createProviderRegistry({
  openai: createOpenAI(),
  openrouter: createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
  }),
  cerebras: createCerebras({
    apiKey: env.CEREBRAS_API_KEY,
  }),
});
