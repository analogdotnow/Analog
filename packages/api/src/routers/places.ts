import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@repo/env/server";

import { GooglePlacesProvider } from "../providers/google-places";
import { autocompleteInputSchema } from "../schemas/places";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { getIp } from "../utils/ip";

let ratelimit: Ratelimit | null = null;

function getRateLimiter() {
  if (!ratelimit) {
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1m"),
      analytics: true,
      prefix: "ratelimit:google-places",
    });
  }

  return ratelimit;
}

export const placesRouter = createTRPCRouter({
  autocomplete: publicProcedure
    .input(autocompleteInputSchema)
    .query(async ({ input, ctx }) => {
      const identifier = getIp(ctx.headers);
      const limiter = getRateLimiter();

      const { success } = await limiter.limit(identifier);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many requests. Please try again later.",
        });
      }

      const placesProvider = new GooglePlacesProvider();

      return await placesProvider.autocomplete(input.input, {
        languageCode: input.languageCode,
        limit: input.limit,
      });
    }),
});
