import type { ProviderOptions, TaskProvider, Task } from "../types";


export class GoogleTasksProvider implements TaskProvider {
  public providerId = "google" as const;

  constructor({ accessToken }: ProviderOptions) {
  }

  async tasks(): Promise<Task[]> {
    return [];
  }

  async createTask(task: Omit<Task, "id">): Promise<Task> {
    return {} as Task;
  }

  async updateTask(taskId: string, task: Partial<Task>): Promise<Task> {
    return {} as Task;
  }

  async deleteTask(taskId: string): Promise<void> {
    return;
  }

}
