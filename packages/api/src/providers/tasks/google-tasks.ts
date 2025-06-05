import { GoogleTasks} from "@repo/google-tasks";
import type { ProviderOptions, TaskProvider, Task, TaskList } from "../types";


export class GoogleTasksProvider implements TaskProvider {
  public providerId = "google" as const;
  private static readonly TASK_LIST_ID_REGEX = /lists\/(.*?)\/tasks/;
  private client: GoogleTasks;

  constructor({ accessToken }: ProviderOptions) {
    this.client = new GoogleTasks({
      accessToken,
    });
  }

  async taskLists() {
    const { items } = await this.client.tasks.v1.users.me.lists.list();
    console.log(items);

    if (!items) return [];

    return items
      .filter((taskList) => taskList.id && taskList.title)
      .map((taskList) => ({
        id: taskList.id!,
        provider: "google",
        title: taskList.title,
        updated: taskList.updated,
      }));
  }

  async tasks(): Promise<Task[]> {
    const { items: taskLists } = await this.client.tasks.v1.users.me.lists.list();
  
    const results = await Promise.all(
      taskLists?.map(async (taskList) => {
        return await this.client.tasks.v1.lists.tasks.list(taskList.id!);
      }) ?? []
    );
  
    const tasks = results.flatMap((result) => result.items ?? []);
  
    return tasks
      .filter((task) => task.id && task.title)
      .map((task) => ({
        id: task.id!,
        taskListId: GoogleTasksProvider.TASK_LIST_ID_REGEX.exec(task.selfLink ?? "")?.[1],
        title: task.title,
        status: task.status,
        completed: task.completed,
        notes: task.notes,
        due: task.due,
      }));
  }

  async tasksForList(taskList: TaskList): Promise<Task[]> {
    const { items } = await this.client.tasks.v1.lists.tasks.list(taskList.id!);

    if (!items) return [];

    return items
      .filter((task) => task.id && task.title)
      .map((task) => ({
        id: task.id!,
        title: task.title,
        status: task.status,
        completed: task.completed,
        notes: task.notes,
        due: task.due,
      }));
  }

  async createTask(taskList: TaskList, task: Omit<Task, "id">): Promise<Task> {
    const { id } = await this.client.tasks.v1.lists.tasks.create(taskList.id!, task);
    return {
      id: id!,
      ...task,
    };
  }

  async updateTask(taskList: TaskList, task: Partial<Task>): Promise<Task> {
    const params = {
      tasklist: taskList.id!,
      ...task,
    };
    const { id } = await this.client.tasks.v1.lists.tasks.update(task.id!, params);
    return {
      id: id!,
      ...task,
    };
  }

  async deleteTask(taskList: TaskList, taskId: string): Promise<void> {
    const params = {
      tasklist: taskList.id!,
    };
    await this.client.tasks.v1.lists.tasks.delete(taskId, params);
    return;
  }

}
