import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, mcp } from "better-auth/plugins";

import { db } from "@repo/db";
import type { account as accountTable } from "@repo/db/schema";
import { env } from "@repo/env/server";

import {
  createProviderHandler,
  handleUnlinkAccount,
} from "./utils/account-linking";

export const MICROSOFT_OAUTH_SCOPES = [
  "https://graph.microsoft.com/User.Read",
  "https://graph.microsoft.com/Calendars.Read",
  "https://graph.microsoft.com/Calendars.Read.Shared",
  "https://graph.microsoft.com/Calendars.ReadBasic",
  "https://graph.microsoft.com/Calendars.ReadWrite",
  "https://graph.microsoft.com/Calendars.ReadWrite.Shared",
  "offline_access",
];

export const GOOGLE_OAUTH_SCOPES = [
  "email",
  "profile",
  "openid",
  "https://www.googleapis.com/auth/calendar",
  // "https://www.googleapis.com/auth/tasks",
];

export const ZOOM_OAUTH_SCOPES = [
  "user:read",
  "calendar:read",
  "calendar:write",
  "meeting:read",
  "meeting:write",
  "offline_access",
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // secondaryStorage: secondaryStorage(),
  session: {
    updateAge: 24 * 60 * 60 * 3, // 3 days in seconds
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
      trustedProviders: ["google", "microsoft", "zoom"],
    },
  },
  user: {
    additionalFields: {
      defaultAccountId: {
        type: "string",
        required: false,
        input: false,
      },
      defaultCalendarId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  hooks: {
    after: handleUnlinkAccount,
  },
  databaseHooks: {
    account: {
      create: {
        after: createProviderHandler,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: GOOGLE_OAUTH_SCOPES,
      accessType: "offline",
      prompt: "consent",
      overrideUserInfoOnSignIn: true,
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      scope: MICROSOFT_OAUTH_SCOPES,
      overrideUserInfoOnSignIn: true,
    },
    zoom: {
      clientId: env.ZOOM_CLIENT_ID,
      clientSecret: env.ZOOM_CLIENT_SECRET,
      scope: ZOOM_OAUTH_SCOPES,
      overrideUserInfoOnSignIn: true,
    },
  },
  plugins: [
    apiKey({
      enableMetadata: true,
    }),
    mcp({
      loginPage: "/login",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type McpSession = Awaited<ReturnType<typeof auth.api.getMcpSession>>;
export type User = Session["user"];
export type Account = typeof accountTable.$inferSelect;
export type ApiKey = Awaited<ReturnType<typeof auth.api.getApiKey>>;
