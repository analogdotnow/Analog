import { z } from "zod";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { notificationEvent } from "@repo/db/schema";

const createReminderSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
  reminderTime: z.date(),
});

export const remindersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createReminderSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { title, body, reminderTime } = input;

      const reminder = await ctx.db
        .insert(notificationEvent)
        .values({
          id: nanoid(),
          userId,
          title,
          body,
          reminderTime,
        })
        .returning();

      return reminder[0];
    }),

  list: protectedProcedure
    .input(z.object({
      sent: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { sent, limit } = input;

      let query = ctx.db
        .select()
        .from(notificationEvent)
        .where(eq(notificationEvent.userId, userId))
        .limit(limit);

      if (sent !== undefined) {
        query = query.where(eq(notificationEvent.sent, sent));
      }

      return await query;
    }),

  markAsSent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id } = input;

      await ctx.db
        .update(notificationEvent)
        .set({
          sent: true,
          updatedAt: new Date(),
        })
        .where(
          eq(notificationEvent.id, id) &&
          eq(notificationEvent.userId, userId)
        );

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { id } = input;

      await ctx.db
        .delete(notificationEvent)
        .where(
          eq(notificationEvent.id, id) &&
          eq(notificationEvent.userId, userId)
        );

      return { success: true };
    }),
}); 