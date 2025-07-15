import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "@repo/env/server";

export const aiRouter = createTRPCRouter({
  getDeepseekToken: protectedProcedure
    .input(z.object({
      url: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // exit early so we don't request tokens while in dev mode
      if (env.NODE_ENV === "development") {
        return {
          key: env.DEEPSEEK_API_KEY,
          url: input.url,
        };
      }

      try {
        return {
          key: env.DEEPSEEK_API_KEY,
          url: input.url,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate Deepseek token",
        });
      }
    }),
});
