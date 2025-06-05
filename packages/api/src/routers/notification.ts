import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@repo/db";
import { notification } from "@repo/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  notificationMarkAsReadRequest,
  notificationPaginationRequest,
} from "../utils/notification";

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
        .offset((input.page - 1) * input.limit);

      return { data };
    }),
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const count = await db
      .select({ count: db.$count(notification.id) })
      .from(notification)
      .where(
        and(eq(notification.userId, userId), isNotNull(notification.readAt)),
      );

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
});
