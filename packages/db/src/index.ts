import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

import { env } from "@repo/env/server";

import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof neon> | undefined;
};

/**
 * Use Neon's serverless driver which is compatible with Cloudflare Workers
 */
const conn = globalForDb.conn ?? neon(env.DATABASE_URL ?? "");
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

/**
 * Automatically map camelCase to snake_case in the database.
 * @see https://orm.drizzle.team/docs/sql-schema-declaration#camel-and-snake-casing
 */
export const db = drizzle(conn, { schema, casing: "snake_case" });
