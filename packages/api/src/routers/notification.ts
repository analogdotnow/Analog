import { and, eq, isNotNull, isNull } from "drizzle-orm";
import z from "zod";

import { db } from "@repo/db";
import {
  notification,
  notificationPushSubscription,
  notificationSourceEvent,
} from "@repo/db/schema";

import {
  notificationMarkAsReadRequest,
  notificationPaginationRequest,
  notificationSubcribeRequest,
} from "../schemas/notification";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { sendPushNotification } from "../utils/push-notification";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(notificationPaginationRequest)
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const queries = [
        eq(notification.userId, userId),
        input.read === false ? undefined : isNotNull(notification.readAt),
        input.type ? eq(notification.type, input.type) : undefined,
      ];
      const data = await db
        .select()
        .from(notification)
        .where(and(...queries.filter(Boolean)))
        .limit(input.limit)
        .offset((input.page - 1) * input.limit)
        .leftJoin(
          notificationSourceEvent,
          eq(notification.sourceEvent, notificationSourceEvent.id),
        )
        .orderBy(notification.createdAt);

      return { data };
    }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const count = await db
      .select({
        count: db.$count(notification),
      })
      .from(notification)
      .where(and(eq(notification.userId, userId), isNull(notification.readAt)));

    return {
      count: count[0]?.count ?? 0,
    };
  }),
  markAsRead: protectedProcedure
    .input(notificationMarkAsReadRequest)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const result = await db
        .update(notification)
        .set({ readAt: new Date() })
        .where(
          and(eq(notification.id, input.id), eq(notification.userId, userId)),
        );

      return { success: result.count > 0 };
    }),
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const result = await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(eq(notification.userId, userId));

    return { success: result.count > 0 };
  }),
  subscribe: protectedProcedure
    .input(notificationSubcribeRequest)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const result = await db
        .insert(notificationPushSubscription)
        .values({
          userId,
          endpoint: input.endpoint,
          p256dh: input.keys.p256dh, // Add p256dh key
          auth: input.keys.auth, // Add auth key
          expirationTime: input.expirationTime
            ? new Date(input.expirationTime)
            : null,
        })
        .onConflictDoUpdate({
          target: notificationPushSubscription.endpoint, // Specify the conflict target
          set: {
            // Define what to update on conflict
            p256dh: input.keys.p256dh,
            auth: input.keys.auth,
            expirationTime: input.expirationTime
              ? new Date(input.expirationTime)
              : null,
          },
        })
        .returning();

      return { success: !!result, data: result[0] || null };
    }),
  unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const result = await db
      .delete(notificationPushSubscription)
      .where(eq(notificationPushSubscription.userId, userId));

    return { success: result.count > 0 };
  }),
  create: protectedProcedure
    .input(
      z.object({
        endpoint: z.string(),
        title: z.string(),
        body: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await sendPushNotification(
        {
          endpoint: input.endpoint,
          keys: input.keys,
        },
        {
          title: input.title,
          body: input.body,
          data: {
            type: "custom",
            sourceId: null,
            eventId: null,
          },
        },
      );

      return { success: result.statusCode === 201, data: result };
    }),
});
