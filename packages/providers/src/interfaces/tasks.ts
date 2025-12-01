import type { Temporal } from "temporal-polyfill";

export interface TaskCollection {
  id: string;
  providerId?: string;
  title?: string;
  updated?: string;
  providerAccountId: string;
}

export interface TaskCollectionWithTasks extends TaskCollection {
  tasks: Task[];
}

export interface Task {
  id: string;
  providerAccountId: string;
  taskCollectionId: string;
  providerId?: string;
  title?: string;
  etag?: string;
  completed?: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
  description?: string;
  due?: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
}
