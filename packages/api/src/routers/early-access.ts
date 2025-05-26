import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@repo/env/server";
import { getIp } from "../utils/ip";

let ratelimit: Ratelimit | null = null;
let initializationAttempted = false;

function getRateLimiter(): Ratelimit | null {
  if (!ratelimit && !initializationAttempted) {
    initializationAttempted = true;
    // Check if environment variables are available
    if (!env.UPSTASH_REDIS_REST_URL?.trim() || !env.UPSTASH_REDIS_REST_TOKEN?.trim()) {
      console.warn("Upstash Redis environment variables not found. Rate limiting disabled.");
      return null;
    }
    
    try {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });

      ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(2, "1m"),
        analytics: true,
        prefix: "ratelimit:early-access-waitlist",
      });
    } catch (error) {
      console.error("Failed to initialize rate limiter:", error);
      return null;
    }
  }
  return ratelimit;
}

export const earlyAccessRouter = createTRPCRouter({
  getWaitlistCount: publicProcedure.query(async () => {
    const waitlistCount = await db.select({ count: count() }).from(waitlist);

    if (!waitlistCount[0]) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get waitlist count",
      });
    }

    return {
      count: waitlistCount[0].count,
    };
  }),
  joinWaitlist: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Apply rate limiting if available
      const limiter = getRateLimiter();
      if (limiter) {
        const ip = getIp(ctx.headers);
        const { success } = await limiter.limit(ip);

        if (!success) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again later.",
          });
        }
      }

      const userAlreadyInWaitlist = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, input.email));

      if (userAlreadyInWaitlist[0]) {
        return { message: "You're already on the waitlist!" };
      }

      await db.insert(waitlist).values({
        email: input.email,
      });

      return { message: "You've been added to the waitlist!" };
    }),
});
