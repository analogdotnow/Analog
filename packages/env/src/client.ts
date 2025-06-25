import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_ENV: z.enum(["development", "test", "production"]),
  },
  runtimeEnv: {
    NEXT_PUBLIC_VERCEL_URL: "https://analog-calendar.thomas-development.workers.dev",
    NEXT_PUBLIC_ENV: "production",
  },
  skipValidation: process.env.NODE_ENV !== "production",
});
