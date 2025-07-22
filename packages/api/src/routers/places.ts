import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { GooglePlacesProvider } from "../providers/google-places";
import { autocompleteInputSchema } from "../schemas/places";
import { createTRPCRouter, publicProcedure } from "../trpc";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

export const placesRouter = createTRPCRouter({
  autocomplete: publicProcedure
    .input(autocompleteInputSchema)
    .query(async ({ input, ctx }) => {
      const identifier = ctx.headers.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(identifier);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded for places autocomplete",
        });
      }

      const placesProvider = new GooglePlacesProvider();
      return await placesProvider.autocomplete(input.input, {
        languageCode: input.languageCode,
        limit: input.limit,
      });
    }),
});
