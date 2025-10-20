import Browserbase from "@browserbasehq/sdk";

import { env } from "@repo/env/server";

export const browserbase = new Browserbase({
  apiKey: env.BROWSERBASE_API_KEY,
});
