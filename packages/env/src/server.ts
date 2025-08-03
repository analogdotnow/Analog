import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().url().startsWith("postgresql://"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
    MICROSOFT_CLIENT_ID: z.string().min(1),
    MICROSOFT_CLIENT_SECRET: z.string().min(1),
    ZOOM_CLIENT_ID: z.string().min(1),
    ZOOM_CLIENT_SECRET: z.string().min(1),
    VERCEL_URL: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    MARBLE_WORKSPACE_KEY: z.string().min(1).optional(),
    MARBLE_API_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV !== "production",
});
