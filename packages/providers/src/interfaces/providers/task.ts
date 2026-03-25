import type { CreateTaskInput, UpdateTaskInput } from "@repo/schemas";

import type { Task, TaskCollection, TaskCollectionWithTasks } from "../tasks";

export interface TaskProviderTasksForTaskCollectionOptions {
  taskCollectionId: string;
}

export interface TaskProviderCollections {
  list(): Promise<TaskCollection[]>;
  tasks(options: TaskProviderTasksForTaskCollectionOptions): Promise<Task[]>;
}

export interface TaskProviderCreateTaskOptions {
  task: CreateTaskInput;
}

export interface TaskProviderUpdateTaskOptions {
  task: UpdateTaskInput;
}

export interface TaskProviderDeleteTaskOptions {
  taskCollectionId: string;
  taskId: string;
}

export interface TaskProviderTasks {
  list(): Promise<TaskCollectionWithTasks[]>;
  create(options: TaskProviderCreateTaskOptions): Promise<Task>;
  update(options: TaskProviderUpdateTaskOptions): Promise<Task>;
  delete(options: TaskProviderDeleteTaskOptions): Promise<void>;
}

export interface TaskProvider {
  providerId: "google";
  collections: TaskProviderCollections;
  tasks: TaskProviderTasks;
}
