import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { db } from "@repo/db";
import {
  notification,
  notificationPushSubscription,
  notificationSource,
  notificationSourceEvent,
} from "@repo/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  notificationCreateRequest,
  notificationMarkAsReadRequest,
  notificationPaginationRequest,
  notificationSubcribeRequest,
} from "../utils/notification";
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
      const result = await db.insert(notificationPushSubscription).values({
        userId,
        endpoint: input.endpoint,
        keyAuth: input.keys.auth,
        expirationTime: input.expirationTime
          ? new Date(input.expirationTime)
          : null,
        keyP256dh: input.keys.p256dh,
      });

      return { success: result.count > 0, data: result[0] || null };
    }),
  unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;
    const result = await db
      .delete(notificationPushSubscription)
      .where(eq(notificationPushSubscription.userId, userId));

    return { success: result.count > 0 };
  }),
  create: protectedProcedure
    .input(notificationCreateRequest)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const sourceQuery = await db
        .select()
        .from(notificationSource)
        .where(eq(notificationSource.slug, input.sourceId || "local"));

      if (sourceQuery.length <= 0) {
        throw new Error(
          "Invalid source ID, please provide a valid source slug.",
        );
      }

      const sourceEvent = await db
        .insert(notificationSourceEvent)
        .values({
          sourceId: sourceQuery[0]!.id,
          eventId: input.eventId,
        })
        .returning();

      const result = await db.insert(notification).values({
        userId,
        message: input.body,
        type: input.type,
        sourceEvent: sourceEvent[0]!.id,
      });

      // Send the notification to the push subscription if it exists
      const pushSubscription = await db
        .select()
        .from(notificationPushSubscription)
        .where(eq(notificationPushSubscription.userId, userId));

      if (pushSubscription.length > 0) {
        // Send the notification to the push subscription
        const sendNotifications = pushSubscription.map((subscription) => {
          const payload = {
            title: input.title,
            body: input.body,
            data: {
              type: input.type,
              sourceId: input.sourceId,
              eventId: input.eventId,
            },
          };
          const source = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keyP256dh,
              auth: subscription.keyAuth,
            },
          };
          return sendPushNotification(source, payload);
        });
        const results = await Promise.all(sendNotifications);
        if (results.some((res) => res.statusCode !== 201)) {
          console.error("Failed to send some push notifications:", results);
        }
      }

      return { success: result.count > 0, data: result[0] || null };
    }),
});
