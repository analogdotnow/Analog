import { taskProcedure, createTRPCRouter } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const tasksRouter = createTRPCRouter({
  list: taskProcedure.query(async ({ ctx }) => {
    const accounts = await Promise.all(
      ctx.allTaskClients.map(async ({ client, account }) => {
        const tasks = await client.tasks();


        return {
          id: account.accountId,
          provider: account.providerId,
          name: account.email,
          tasks,
        };
      }),
    );

    return {
      accounts,
    };
  }),

  listTaskLists: taskProcedure.query(async ({ ctx }) => {
    const accounts = await Promise.all(
      ctx.allTaskClients.map(async ({ client, account }) => {
        const taskLists = await client.taskLists();

        return {
          id: account.accountId,
          provider: account.providerId,
          name: account.email,
          taskLists,
        };
      }),
    );

    return {
      accounts,
    };
  }),

  listTasksForList: taskProcedure
    .input(
      z.object({
        accountId: z.string(),
        taskListId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { accountId, taskListId } = input;

      const taskClient = ctx.allTaskClients.find(
        ({ account }) => account.accountId === accountId,
      );

      if (!taskClient?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task client not found for accountId: ${accountId}`,
        });
      }

      const tasks = await taskClient.client.tasksForList({ id: taskListId });

      return { tasks };
    }),

  createTask: taskProcedure
    .input(
      z.object({
        accountId: z.string(),
        taskListId: z.string(),
        task: z.object({
          title: z.string(),
          notes: z.string().optional(),
          due: z.string().optional(),
          status: z.string().optional().default("needsAction"),
          completed: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { accountId, taskListId, task } = input;

      const taskClient = ctx.allTaskClients.find(
        ({ account }) => account.accountId === accountId,
      );

      if (!taskClient?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task client not found for accountId: ${accountId}`,
        });
      }

      const createdTask = await taskClient.client.createTask({ id: taskListId }, task);

      return { task: createdTask };
    }),
});