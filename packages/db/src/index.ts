import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { env } from "@repo/env/server";

export const db = drizzle(env.DATABASE_URL, { schema });
