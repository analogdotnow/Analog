import { createClient } from "@deepgram/sdk";
import { TRPCError } from "@trpc/server";

import { env } from "@repo/env/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const aiRouter = createTRPCRouter({
  getDeepgramToken: protectedProcedure.query(async () => {
    // TODO: check user subscription
    if (env.NODE_ENV === "development") {
      return {
        token: env.DEEPGRAM_API_KEY,
      };
    }

    const deepgram = createClient(env.DEEPGRAM_API_KEY);

    const token = await deepgram.auth.grantToken({
      ttl_seconds: 3600, // 1 hour
    });

    if (token.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: token.error.message,
        cause: token.error,
      });
    }

    return {
      token: token.result.access_token,
    };
  }),
});
