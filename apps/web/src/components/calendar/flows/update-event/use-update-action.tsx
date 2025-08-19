import * as React from "react";
import { useSetAtom } from "jotai";

import {
  addOptimisticActionAtom,
  generateOptimisticId,
} from "../../hooks/optimistic-actions";
import type { UpdateQueueItem, UpdateQueueRequest } from "./update-queue";
import { UpdateQueueContext } from "./update-queue-provider";

export function useUpdateAction() {
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);

  const actorRef = UpdateQueueContext.useActorRef();

  const update = React.useCallback(
    async (req: UpdateQueueRequest) => {
      const optimisticId = generateOptimisticId();

      React.startTransition(() => {
        addOptimisticAction({
          id: optimisticId,
          type: "update",
          eventId: req.event.id,
          event: req.event,
        });
      });

      const item: UpdateQueueItem = {
        optimisticId,
        event: req.event,
        scope: req.scope,
        notify: req.notify,
      };

      actorRef.send({ type: "START", item });

      // Return optimistic id to allow callers to await completion externally
      return optimisticId;
    },
    [actorRef, addOptimisticAction],
  );

  return update;
}
