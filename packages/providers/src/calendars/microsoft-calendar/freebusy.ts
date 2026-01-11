import type { ScheduleItem } from "@microsoft/microsoft-graph-types";

import { parseDateTime } from "./utils";

export function parseScheduleItemStatus(status: ScheduleItem["status"]) {
  // TODO: Handle additional statuses
  switch (status) {
    case "busy":
    case "oof":
      return "busy";
    case "free":
      return "free";
    default:
      return "unknown";
  }
}

export function parseScheduleItem(item: ScheduleItem) {
  return {
    start: parseDateTime(item.start!.dateTime!, item.start!.timeZone!),
    end: parseDateTime(item.end!.dateTime!, item.end!.timeZone!),
    status: parseScheduleItemStatus(item.status),
  };
}
