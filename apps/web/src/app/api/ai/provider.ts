import { createOpenAI } from "@ai-sdk/openai";

import { env } from "@repo/env/server";

export const openRouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});
