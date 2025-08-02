import { GoogleTasks } from "@repo/google-tasks";

export type GoogleTask = GoogleTasks.Tasks.V1.Lists.Tasks.Task;
export type GoogleTaskUpdateParams =
  GoogleTasks.Tasks.V1.Lists.Tasks.TaskUpdateParams;
export type GoogleTaskCategory = GoogleTasks.Tasks.V1.Users.Me.TaskList;
