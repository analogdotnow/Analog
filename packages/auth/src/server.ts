import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@repo/db";
import { env } from "@repo/env/server";

export const GOOGLE_OAUTH_SCOPES = [
  "email",
  "profile",
  "openid",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/calendar",
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: GOOGLE_OAUTH_SCOPES,
      accessType: "offline",
    },
  },
});
