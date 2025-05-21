import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@repo/env/server";
import * as schema from "./schema";

// Disable prefetch as it is not supported for Supabase "Transaction" pool mode
const client = postgres(env.DATABASE_URL, { prepare: false });

export const db = drizzle({ client, schema });