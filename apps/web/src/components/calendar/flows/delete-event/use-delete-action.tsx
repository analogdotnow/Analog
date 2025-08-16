import * as React from "react";
import { useSetAtom } from "jotai";

import { addOptimisticActionAtom } from "../../hooks/optimistic-actions";
import type { DeleteQueueItem, DeleteQueueRequest } from "./delete-queue";
import { DeleteQueueContext } from "./delete-queue-provider";

export function useDeleteAction() {
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);

  const actorRef = DeleteQueueContext.useActorRef();

  const update = React.useCallback(
    async (req: DeleteQueueRequest) => {
      const optimisticId = addOptimisticAction({
        type: "delete",
        eventId: req.event.id,
      });

      const item: DeleteQueueItem = {
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
