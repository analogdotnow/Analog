import { db } from "@repo/db";
import { waitlist } from "@repo/db/schema";
import { count } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const waitlistRouter = createTRPCRouter({
  getWaitlistCount: publicProcedure.query(async () => {
    const waitlistCount = await db.select({ count: count() }).from(waitlist);

    if (!waitlistCount[0])
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching waitlist count",
      });

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
    .mutation(async ({ input }) => {
      const userAlreadyInWaitlist = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, input.email));

      if (userAlreadyInWaitlist[0])
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You're already on the waitlist!",
        });

      await db.insert(waitlist).values({
        email: input.email,
      });

      return {
        success: true,
      };
    }),
});
