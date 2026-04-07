import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    DATABASE_URL: z.string().trim().pipe(z.url().startsWith("postgresql://")),
    BETTER_AUTH_SECRET: z.string().trim().min(32),
    BETTER_AUTH_URL: z.string().trim().pipe(z.url()),
    GOOGLE_CLIENT_ID: z.string().trim().min(1),
    GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
    GOOGLE_MAPS_API_KEY: z.string().trim().min(1).optional(),
    MICROSOFT_CLIENT_ID: z.string().trim().min(1),
    MICROSOFT_CLIENT_SECRET: z.string().trim().min(1),
    ZOOM_CLIENT_ID: z.string().trim().min(1),
    ZOOM_CLIENT_SECRET: z.string().trim().min(1),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
    VERCEL_URL: z.string().trim().optional(),
    UPSTASH_REDIS_REST_URL: z.string().trim().pipe(z.url()),
    UPSTASH_REDIS_REST_TOKEN: z.string().trim().min(1),
    MARBLE_WORKSPACE_KEY: z.string().trim().min(1).optional(),
    MARBLE_API_URL: z.string().trim().pipe(z.url()).optional(),
    COMPOSIO_API_KEY: z.string().trim().optional(),
    OPENROUTER_API_KEY: z.string().trim().min(1).optional(),
    OPENAI_API_KEY: z.string().trim().min(1).optional(),
    CEREBRAS_API_KEY: z.string().trim().min(1).optional(),
    GROQ_API_KEY: z.string().trim().min(1).optional(),
    FIRECRAWL_API_KEY: z.string().trim().min(1),
    BROWSERBASE_API_KEY: z.string().trim().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.NODE_ENV !== "production",
});
