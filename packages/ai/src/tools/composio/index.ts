import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";
import { env } from "@repo/env/server";

export const composio = new Composio({
  apiKey: env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

