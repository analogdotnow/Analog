import { Temporal } from "temporal-polyfill";

import type { CreateTaskInput, UpdateTaskInput } from "@repo/schemas";

import type { Task } from "../../interfaces";
import type { GoogleTask, GoogleTaskUpdateParams } from "./interfaces";

function parseGoogleTaskDate(date: string) {
  return Temporal.PlainDate.from(date.split("T")[0]!);
}

export function parseGoogleTask({
  task,
  collectionId,
  providerAccountId,
}: {
  task: GoogleTask;
  collectionId: string;
  providerAccountId: string;
}): Task {
  return {
    id: task.id!,
    title: task.title,
    completed: task.completed ? parseGoogleTaskDate(task.completed) : undefined,
    description: task.notes,
    due: task.due ? parseGoogleTaskDate(task.due) : undefined,
    providerId: "google",
    providerAccountId,
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
