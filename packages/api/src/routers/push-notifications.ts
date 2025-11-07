import "server-only";

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import webpush from "web-push";
import { z } from "zod";

import { pushSubscription } from "@repo/db/schema";
import { env } from "@repo/env/server";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// Initialize web-push with VAPID details
webpush.setVapidDetails(
  "mailto:noreply@analog.email",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  env.VAPID_PRIVATE_KEY,
);

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const pushNotificationsRouter = createTRPCRouter({
  subscribe: protectedProcedure
    .input(pushSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { endpoint, expirationTime, keys } = input;

      // Check if subscription already exists for this endpoint and user
      const existingSubscription =
        await ctx.db.query.pushSubscription.findFirst({
          where: and(
            eq(pushSubscription.userId, ctx.user.id),
            eq(pushSubscription.endpoint, endpoint),
          ),
        });

      if (existingSubscription) {
        // Update existing subscription
        await ctx.db
          .update(pushSubscription)
          .set({
            keys,
            expirationTime: expirationTime ? new Date(expirationTime) : null,
            updatedAt: new Date(),
          })
          .where(eq(pushSubscription.id, existingSubscription.id));

        return { success: true, id: existingSubscription.id };
      }

      // Create new subscription
      const id = nanoid();
      await ctx.db.insert(pushSubscription).values({
        id,
        userId: ctx.user.id,
        endpoint,
        keys,
        expirationTime: expirationTime ? new Date(expirationTime) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id };
    }),

  unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete all subscriptions for the current user
    await ctx.db
      .delete(pushSubscription)
      .where(eq(pushSubscription.userId, ctx.user.id));

    return { success: true };
  }),

  unsubscribeByEndpoint: protectedProcedure
    .input(z.object({ endpoint: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      // Delete specific subscription by endpoint
      await ctx.db
        .delete(pushSubscription)
        .where(
          and(
            eq(pushSubscription.userId, ctx.user.id),
            eq(pushSubscription.endpoint, input.endpoint),
          ),
        );

      return { success: true };
    }),

  send: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        icon: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, body, icon } = input;

      // Get all subscriptions for the current user
      const subscriptions = await ctx.db.query.pushSubscription.findMany({
        where: eq(pushSubscription.userId, ctx.user.id),
      });

      if (subscriptions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No push subscriptions found",
        });
      }

      const payload = JSON.stringify({
        title,
        body,
        icon: icon || "/icon.png",
      });

      // Send notification to all subscriptions
      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys as { p256dh: string; auth: string },
            },
            payload,
          ),
        ),
      );

      // Count successful and failed sends
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      // Clean up invalid subscriptions (410 Gone or 404 Not Found)
      const invalidIndices = results
        .map((result, index) => {
          if (result.status === "rejected") {
            const error = result.reason as { statusCode?: number };
            if (error.statusCode === 410 || error.statusCode === 404) {
              return index;
            }
          }
          return -1;
        })
        .filter((i) => i !== -1);

      if (invalidIndices.length > 0) {
        await Promise.all(
          invalidIndices.map((i) =>
            ctx.db
              .delete(pushSubscription)
              .where(eq(pushSubscription.id, subscriptions[i]!.id)),
          ),
        );
      }

      return {
        success: true,
        sent: successful,
        failed,
        cleaned: invalidIndices.length,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await ctx.db.query.pushSubscription.findMany({
      where: eq(pushSubscription.userId, ctx.user.id),
      columns: {
        id: true,
        endpoint: true,
        expirationTime: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return subscriptions;
  }),
});
