import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { createAuthOptions } from "./options";

const options = createAuthOptions();

export const auth = betterAuth({
  ...options,
  trustedOrigins: ["http://localhost:3001"],
  plugins: [...options.plugins, tanstackStartCookies()],
});
