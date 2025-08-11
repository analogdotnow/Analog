import { TRPCError } from "@trpc/server";

import { createTaskInputSchema } from "../schemas/tasks";
import { createTRPCRouter, taskProcedure } from "../trpc";

export const tasksRouter = createTRPCRouter({
  create: taskProcedure
    .input(createTaskInputSchema)
    .mutation(async ({ ctx, input }) => {
      const provider = ctx.providers.find(
        ({ account }) => account.id === input.accountId,
      );

      if (!provider?.client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Task client not found for accountId: ${input.accountId}`,
        });
      }

      const task = await provider.client.createTask(input);

      return { task };
    }),
  list: taskProcedure.query(async ({ ctx }) => {
    const promises = ctx.providers.map(async ({ client, account }) => {
      const tasks = await client.tasks();

      return {
        id: account.id,
        providerId: account.providerId,
        name: account.email,
        tasks: tasks.map((task) => ({
          ...task,
        })),
      };
    });

    const accounts = await Promise.all(promises);

    return {
      accounts,
    };
  }),
});
