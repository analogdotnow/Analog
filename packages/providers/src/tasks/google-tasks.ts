import { GoogleTasks } from "@repo/google-tasks";

import type {
  TaskProvider,
  TaskProviderCollections,
  TaskProviderCreateTaskOptions,
  TaskProviderDeleteTaskOptions,
  TaskProviderTasks,
  TaskProviderTasksForTaskCollectionOptions,
  TaskProviderUpdateTaskOptions,
} from "../interfaces/providers";
import { ProviderError } from "../lib/provider-error";
import { parseGoogleTask, toGoogleTask } from "./google-tasks/utils";

interface GoogleTasksProviderOptions {
  accessToken: string;
  providerAccountId: string;
}

class GoogleTasksCollections implements TaskProviderCollections {
  constructor(
    private client: GoogleTasks,
    private providerAccountId: string,
  ) {}

  async list() {
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
          providerAccountId: this.providerAccountId,
        }));
    });
  }

  async tasks({ taskCollectionId }: TaskProviderTasksForTaskCollectionOptions) {
    return this.withErrorHandler("tasksForTaskCollection", async () => {
      const { items: tasks } =
        await this.client.tasks.v1.lists.tasks.list(taskCollectionId);
      return (
        tasks?.map((task) =>
          parseGoogleTask({
            task,
            collectionId: taskCollectionId,
            providerAccountId: this.providerAccountId,
          }),
        ) ?? []
      );
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

class GoogleTasksTasks implements TaskProviderTasks {
  constructor(
    private client: GoogleTasks,
    private providerAccountId: string,
  ) {}

  async list() {
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
            providerAccountId: this.providerAccountId,
            providerId: "google",
            tasks:
              tasks?.map((task) =>
                parseGoogleTask({
                  task,
                  collectionId: taskCollection.id!,
                  providerAccountId: this.providerAccountId,
                }),
              ) ?? [],
          };
        }) ?? [],
      );
      return results;
    });
  }

  create({ task }: TaskProviderCreateTaskOptions) {
    return this.withErrorHandler("createTask", async () => {
      const createdTask = await this.client.tasks.v1.lists.tasks.create(
        task.taskCollectionId,
        toGoogleTask(task),
      );
      return parseGoogleTask({
        task: createdTask,
        collectionId: task.taskCollectionId,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  update({ task }: TaskProviderUpdateTaskOptions) {
    return this.withErrorHandler("updateTask", async () => {
      const updatedTask = await this.client.tasks.v1.lists.tasks.update(
        task.id,
        toGoogleTask(task),
      );
      return parseGoogleTask({
        task: updatedTask,
        collectionId: task.taskCollectionId,
        providerAccountId: this.providerAccountId,
      });
    });
  }

  delete({ taskCollectionId, taskId }: TaskProviderDeleteTaskOptions) {
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

export class GoogleTasksProvider implements TaskProvider {
  public readonly providerId = "google" as const;
  public readonly providerAccountId: string;
  private client: GoogleTasks;
  public readonly collections: GoogleTasksCollections;
  public readonly tasks: GoogleTasksTasks;

  constructor({ accessToken, providerAccountId }: GoogleTasksProviderOptions) {
    this.providerAccountId = providerAccountId;
    this.client = new GoogleTasks({
      accessToken,
    });
    this.collections = new GoogleTasksCollections(
      this.client,
      providerAccountId,
    );
    this.tasks = new GoogleTasksTasks(this.client, providerAccountId);
  }
}
