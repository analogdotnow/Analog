import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

declare global {
  interface ImportMetaEnv {
    readonly VITE_VERCEL_URL: string | undefined;
    readonly VITE_VERCEL_ENV:
      | "development"
      | "preview"
      | "production"
      | undefined;
    readonly VITE_GOOGLE_MAPS_API_KEY: string | undefined;
  }
}

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_ENV: z.enum(["development", "test", "production"]),
    VITE_VERCEL_URL: z.string().trim().optional(),
    VITE_VERCEL_ENV: z
      .enum(["development", "preview", "production"])
      .optional(),
    VITE_GOOGLE_MAPS_API_KEY: z.string().trim().optional(),
  },
  runtimeEnv: {
    VITE_ENV: import.meta.env.MODE,
    VITE_VERCEL_URL: import.meta.env.VITE_VERCEL_URL,
    VITE_VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
    VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  },
  emptyStringAsUndefined: true,
  skipValidation: import.meta.env.MODE !== "production",
});
