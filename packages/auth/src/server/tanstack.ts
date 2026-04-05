import "server-only";

import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { createAuthOptions } from "./options";

const options = createAuthOptions();

export const auth = betterAuth({
  ...options,
  plugins: [...options.plugins, tanstackStartCookies()],
});
