import type {
  Task,
  TaskCollection,
  TaskCollectionWithTasks,
} from "../../interfaces/tasks";
import type { CreateTaskInput, UpdateTaskInput } from "../../schemas/tasks";

export interface TaskProvider {
  providerId: "google";
  tasks(): Promise<TaskCollectionWithTasks[]>;
  taskCollections(): Promise<TaskCollection[]>;
  tasksForTaskCollection(taskCollectionId: string): Promise<Task[]>;
  createTask(task: CreateTaskInput): Promise<Task>;
  updateTask(task: UpdateTaskInput): Promise<Task>;
  deleteTask(taskCollectionId: string, taskId: string): Promise<void>;
}
