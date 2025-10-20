import FirecrawlApp from "@mendable/firecrawl-js";

import { env } from "@repo/env/server";

export const firecrawl = new FirecrawlApp({
  apiKey: env.FIRECRAWL_API_KEY,
});
