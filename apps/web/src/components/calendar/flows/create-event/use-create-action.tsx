import * as React from "react";
import { useSetAtom } from "jotai";

import { removeDraftOptimisticActionsByEventIdAtom } from "@/hooks/calendar/optimistic-actions";
import { useWriteLane } from "../write-lane-provider";
import type { CreateQueueItem, CreateQueueRequest } from "./create-queue";
import { CreateQueueContext } from "./create-queue-provider";

export function useCreateAction() {
  const lane = useWriteLane();
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

  const actorRef = CreateQueueContext.useActorRef();

  const update = React.useCallback(
    async (req: CreateQueueRequest) => {
      const token = await lane.stage(req.event.id, {
        kind: "create",
        event: req.event,
      });

      if (!token) {
        return;
      }

      // The draft overlay is superseded by the lane overlay for this event.
      removeDraftOptimisticActionsByEventId(req.event.id);

      const item: CreateQueueItem = {
        event: req.event,
        token,
        notify: req.notify,
        onSuccess: req.onSuccess,
        onCancel: req.onCancel,
      };

      actorRef.send({ type: "START", item });
    },
    [actorRef, lane, removeDraftOptimisticActionsByEventId],
  );

  return update;
}
