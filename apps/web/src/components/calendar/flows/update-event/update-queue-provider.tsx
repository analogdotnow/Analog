import * as React from "react";
import { createActorContext } from "@xstate/react";

import { useWriteLane } from "../write-lane-provider";
import { createUpdateQueueMachine } from "./update-queue";

export const UpdateQueueContext = createActorContext(
  createUpdateQueueMachine({
    dispatch: () => {},
    cancel: () => {},
  }),
);

interface UpdateQueueProviderProps {
  children: React.ReactNode;
}

export function UpdateQueueProvider({ children }: UpdateQueueProviderProps) {
  const lane = useWriteLane();

  const logic = React.useMemo(
    () =>
      createUpdateQueueMachine({
        dispatch: (item) => {
          void lane.enqueue({
            kind: "update",
            id: item.event.id,
            changes: item.changes,
            scope: item.scope,
            notify: item.notify,
            onSuccess: item.onSuccess,
            token: item.token,
          });
        },
        cancel: (item) => {
          lane.unstage(item.token);
          item.onCancel?.();
        },
      }),
    [lane],
  );

  return (
    <UpdateQueueContext.Provider logic={logic}>
      {children}
    </UpdateQueueContext.Provider>
  );
}
