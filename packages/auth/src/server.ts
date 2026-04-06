import { betterAuth } from "better-auth";

import type { account as accountTable } from "@repo/db/schema";

import { createAuthOptions } from "./server/options";

export const auth = betterAuth(createAuthOptions());

export type Session = typeof auth.$Infer.Session;
export type McpSession = Awaited<ReturnType<typeof auth.api.getMcpSession>>;
export type User = Session["user"];
export type Account = typeof accountTable.$inferSelect;
export type ApiKey = Awaited<ReturnType<typeof auth.api.getApiKey>>;
