import * as React from "react";
import { useSetAtom } from "jotai";

import { addOptimisticActionAtom } from "../../hooks/optimistic-actions";
import type { UpdateQueueItem, UpdateQueueRequest } from "./update-queue";
import { UpdateQueueContext } from "./update-queue-provider";

export function useUpdateAction() {
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);

  const actorRef = UpdateQueueContext.useActorRef();

  const update = React.useCallback(
    async (req: UpdateQueueRequest) => {
      const optimisticId = addOptimisticAction({
        type: "update",
        eventId: req.event.id,
        event: req.event,
      });

      const item: UpdateQueueItem = {
        optimisticId,
        event: req.event,
        scope: req.scope,
        notify: req.notify,
      };

      actorRef.send({ type: "START", item });
    },
    [actorRef, addOptimisticAction],
  );

  return update;
}
