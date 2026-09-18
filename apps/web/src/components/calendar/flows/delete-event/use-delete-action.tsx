import * as React from "react";

import { useWriteLane } from "../write-lane-provider";
import type { DeleteQueueItem, DeleteQueueRequest } from "./delete-queue";
import { DeleteQueueContext } from "./delete-queue-provider";

export function useDeleteAction() {
  const lane = useWriteLane();

  const actorRef = DeleteQueueContext.useActorRef();

  const update = React.useCallback(
    async (req: DeleteQueueRequest) => {
      const token = await lane.stage(req.event.id, { kind: "delete" });

      const item: DeleteQueueItem = {
        event: req.event,
        token,
        scope: req.scope,
        notify: req.notify,
      };

      actorRef.send({ type: "START", item });
    },
    [actorRef, lane],
  );

  return update;
}
