import { isBefore } from "@repo/temporal";

import { insertIntoSorted } from "@/lib/sorted-actions";
import { EventCollectionItem, convertEventToItem } from "./event-collection";
import { OptimisticAction } from "./optimistic-actions";

interface ApplyOptimisticActionsOptions {
  items: EventCollectionItem[];
  timeZone: string;
  optimisticActions: Record<string, OptimisticAction>;
}

export function applyOptimisticActions({
  items,
  timeZone,
  optimisticActions,
}: ApplyOptimisticActionsOptions) {
  let optimisticItems = items.filter(
    (event) => optimisticActions[event.event.id] === undefined,
  );

  for (const action of Object.values(optimisticActions)) {
    if (action.type === "update") {
      const item = convertEventToItem(action.event, timeZone);

      optimisticItems = insertIntoSorted(optimisticItems, item, (a) =>
        isBefore(a.start, action.event.start, {
          timeZone,
        }),
      );
    } else if (action.type === "delete") {
      optimisticItems = optimisticItems.filter(
        (event) => event.event.id !== action.eventId,
      );
    } else if (action.type === "create") {
      const item = convertEventToItem(action.event, timeZone);
      optimisticItems = insertIntoSorted(optimisticItems, item, (a) =>
        isBefore(a.start, action.event.start, {
          timeZone,
        }),
      );
    } else if (action.type === "draft") {
      const item = convertEventToItem(action.event, timeZone);

      console.log("DRAFT ITEM", JSON.stringify(item, null, 2));
      optimisticItems = insertIntoSorted(optimisticItems, item, (a) =>
        isBefore(a.start, action.event.start, {
          timeZone,
        }),
      );
    }
  }

  return optimisticItems;
}
