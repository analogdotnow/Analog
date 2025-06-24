import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@repo/env/server";

import * as schema from "./schema";

/**
 * Use Neon's serverless driver which is compatible with Cloudflare Workers
 * The drizzle-orm/neon-serverless adapter expects a connection string directly
 */
export const db = drizzle(env.DATABASE_URL ?? "", { schema });
