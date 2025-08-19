import * as React from "react";
import { useSetAtom } from "jotai";

import {
  addOptimisticActionAtom,
  generateOptimisticId,
} from "../../hooks/optimistic-actions";
import type { CreateQueueItem, CreateQueueRequest } from "./create-queue";
import { CreateQueueContext } from "./create-queue-provider";

export function useCreateAction() {
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);

  const actorRef = CreateQueueContext.useActorRef();

  const update = React.useCallback(
    async (req: CreateQueueRequest) => {
      const optimisticId = generateOptimisticId();

      React.startTransition(() => {
        addOptimisticAction({
          id: optimisticId,
          type: "create",
          eventId: req.event.id,
          event: req.event,
        });
      });

      const item: CreateQueueItem = {
        optimisticId,
        event: req.event,
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
