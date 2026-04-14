import { apiKeyClient } from "@better-auth/api-key/client";
import {
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { auth } from "./server";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    apiKeyClient(),
    magicLinkClient(),
  ],
});
