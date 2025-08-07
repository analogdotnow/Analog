import GoogleTasks from "@repo/google-tasks";

import {
  Task,
  TaskCollection,
  TaskCollectionWithTasks,
} from "../../interfaces";
import { CreateTaskInput, UpdateTaskInput } from "../../schemas/tasks";
import { TaskProvider } from "../interfaces";
import { ProviderError } from "../lib/provider-error";
import { parseGoogleTask, toGoogleTask } from "./google-tasks/utils";

interface GoogleTasksProviderOptions {
  accessToken: string;
  accountId: string;
}

export class GoogleTasksProvider implements TaskProvider {
  public readonly providerId = "google" as const;
  public readonly accountId: string;
  private client: GoogleTasks;

  constructor({ accessToken, accountId }: GoogleTasksProviderOptions) {
    this.accountId = accountId;
    this.client = new GoogleTasks({
      accessToken,
    });
  }

  async taskCollections(): Promise<TaskCollection[]> {
    return this.withErrorHandler("taskCollections", async () => {
      const { items: taskCollections } =
        await this.client.tasks.v1.users.me.lists.list();
      if (!taskCollections) return [];

      return taskCollections
        .filter((taskCollection) => taskCollection.id && taskCollection.title)
        .map((taskCollection) => ({
          id: taskCollection.id!,
          providerId: "google",
          title: taskCollection.title,
          updated: taskCollection.updated,
          accountId: this.accountId,
        }));
    });
  }
  async tasks(): Promise<TaskCollectionWithTasks[]> {
    return this.withErrorHandler("tasks", async () => {
      const { items: taskCollections } =
        await this.client.tasks.v1.users.me.lists.list();

      const results = await Promise.all(
        taskCollections?.map(async (taskCollection) => {
          const { items: tasks } = await this.client.tasks.v1.lists.tasks.list(
            taskCollection.id!,
          );
          return {
            id: taskCollection.id!,
            title: taskCollection.title!,
            accountId: this.accountId,
            providerId: "google",
            tasks:
              tasks?.map((task) =>
                parseGoogleTask({
                  task,
                  collectionId: taskCollection.id!,
                  accountId: this.accountId,
                }),
              ) ?? [],
          };
        }) ?? [],
      );
      return results;
    });
  }

  createTask(task: CreateTaskInput): Promise<Task> {
    return this.withErrorHandler("createTask", async () => {
      const createdTask = await this.client.tasks.v1.lists.tasks.create(
        task.taskCollectionId,
        toGoogleTask(task),
      );
      return parseGoogleTask({
        task: createdTask,
        collectionId: task.taskCollectionId,
        accountId: this.accountId,
      });
    });
  }

  tasksForTaskCollection(taskCollectionId: string): Promise<Task[]> {
    return this.withErrorHandler("tasksForTaskCollection", async () => {
      const { items: tasks } =
        await this.client.tasks.v1.lists.tasks.list(taskCollectionId);
      return (
        tasks?.map((task) =>
          parseGoogleTask({
            task,
            collectionId: taskCollectionId,
            accountId: this.accountId,
          }),
        ) ?? []
      );
    });
  }

  updateTask(task: UpdateTaskInput): Promise<Task> {
    return this.withErrorHandler("updateTask", async () => {
      const updatedTask = await this.client.tasks.v1.lists.tasks.update(
        task.id,
        toGoogleTask(task),
      );
      return parseGoogleTask({
        task: updatedTask,
        collectionId: task.taskCollectionId,
        accountId: this.accountId,
      });
    });
  }

  deleteTask(taskCollectionId: string, taskId: string): Promise<void> {
    return this.withErrorHandler("deleteTask", async () => {
      await this.client.tasks.v1.lists.tasks.delete(taskId, {
        tasklist: taskCollectionId,
      });
    });
  }

  private async withErrorHandler<T>(
    operation: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      console.error(`Failed to ${operation}:`, error);

      throw new ProviderError(error as Error, operation, context);
    }
  }
}
