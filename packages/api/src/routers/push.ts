import { z } from "zod";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pushSubscription } from "@repo/db/schema";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
});

export const pushRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(subscribeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { endpoint, p256dh, auth } = input;

      // Check if subscription already exists
      const existing = await ctx.db
        .select()
        .from(pushSubscription)
        .where(eq(pushSubscription.endpoint, endpoint))
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription
        await ctx.db
          .update(pushSubscription)
          .set({
            p256dh,
            auth,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscription.endpoint, endpoint));
        
        return { success: true, updated: true };
      }

      // Create new subscription
      await ctx.db.insert(pushSubscription).values({
        id: nanoid(),
        userId,
        endpoint,
        p256dh,
        auth,
      });

      return { success: true, updated: false };
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { endpoint } = input;

      await ctx.db
        .delete(pushSubscription)
        .where(
          eq(pushSubscription.endpoint, endpoint) &&
          eq(pushSubscription.userId, userId)
        );

      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const subscriptions = await ctx.db
      .select()
      .from(pushSubscription)
      .where(eq(pushSubscription.userId, userId));

    return subscriptions;
  }),
}); 