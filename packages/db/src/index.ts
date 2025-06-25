import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@repo/env/server";

import * as schema from "./schema";

/**
 * Database connection for Cloudflare Workers
 * Uses Neon serverless driver which is compatible with edge environments
 */
console.log("Creating db connection drizzle");
export const db = drizzle(env.DATABASE_URL ?? "", {
  schema,
});
