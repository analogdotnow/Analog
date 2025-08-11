import { Temporal } from "temporal-polyfill";

import type { Task } from "../../../interfaces";
import type { CreateTaskInput, UpdateTaskInput } from "../../../schemas/tasks";
import type { GoogleTask, GoogleTaskUpdateParams } from "./interfaces";

function parseGoogleTaskDate(date: string) {
  return Temporal.PlainDate.from(date.split("T")[0]!);
}

export function parseGoogleTask({
  task,
  collectionId,
  accountId,
}: {
  task: GoogleTask;
  collectionId: string;
  accountId: string;
}): Task {
  return {
    id: task.id!,
    title: task.title,
    completed: task.completed ? parseGoogleTaskDate(task.completed) : undefined,
    description: task.notes,
    due: task.due ? parseGoogleTaskDate(task.due) : undefined,
    providerId: "google",
    accountId,
    taskCollectionId: collectionId,
  };
}

export function toGoogleTask(
  task: CreateTaskInput | UpdateTaskInput,
): GoogleTaskUpdateParams {
  return {
    ...("id" in task ? { id: task.id } : {}),
    title: task.title,
    notes: task.description,
    due: task.due?.toString(),
    status: task.completed ? "completed" : "needsAction",
    completed: task.completed?.toString(),
    tasklist: task.taskCollectionId,
  };
}
