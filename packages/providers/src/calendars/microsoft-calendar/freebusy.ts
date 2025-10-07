import type { ScheduleItem } from "@microsoft/microsoft-graph-types";

import { parseDateTime } from "./utils";

export function parseScheduleItemStatus(status: ScheduleItem["status"]) {
  // TODO: Handle additional statuses
  if (status === "busy" || status === "oof") {
    return "busy";
  }

  if (status === "free") {
    return "free";
  }

  return "unknown";
}

export function parseScheduleItem(item: ScheduleItem) {
  return {
    start: parseDateTime(item.start!.dateTime!, item.start!.timeZone!),
    end: parseDateTime(item.end!.dateTime!, item.end!.timeZone!),
    status: parseScheduleItemStatus(item.status),
  };
}
