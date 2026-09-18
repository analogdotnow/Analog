import * as React from "react";
import { createActorContext } from "@xstate/react";

import { useWriteLane } from "../write-lane-provider";
import { createDeleteQueueMachine } from "./delete-queue";

export const DeleteQueueContext = createActorContext(
  createDeleteQueueMachine({
    dispatch: () => {},
    cancel: () => {},
  }),
);

interface DeleteQueueProviderProps {
  children: React.ReactNode;
}

export function DeleteQueueProvider({ children }: DeleteQueueProviderProps) {
  const lane = useWriteLane();

  const logic = React.useMemo(
    () =>
      createDeleteQueueMachine({
        dispatch: (item) => {
          void lane.enqueue({
            kind: "delete",
            event: item.event,
            scope: item.scope,
            notify: item.notify,
            token: item.token,
          });
        },
        cancel: (item) => {
          lane.unstage(item.token);
        },
      }),
    [lane],
  );

  return (
    <DeleteQueueContext.Provider logic={logic}>
      {children}
    </DeleteQueueContext.Provider>
  );
}
