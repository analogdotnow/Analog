import * as React from "react";
import { createActorContext } from "@xstate/react";

import { useWriteLane } from "../write-lane-provider";
import { createCreateQueueMachine } from "./create-queue";

export const CreateQueueContext = createActorContext(
  createCreateQueueMachine({
    dispatch: () => {},
    cancel: () => {},
  }),
);

interface CreateQueueProviderProps {
  children: React.ReactNode;
}

export function CreateQueueProvider({ children }: CreateQueueProviderProps) {
  const lane = useWriteLane();

  const logic = React.useMemo(
    () =>
      createCreateQueueMachine({
        dispatch: (item) => {
          void lane.enqueue({
            kind: "create",
            event: item.event,
            notify: item.notify,
            onSuccess: item.onSuccess,
          });
        },
        cancel: (item) => {
          lane.restoreOverlay(item.event.id);
        },
      }),
    [lane],
  );

  return (
    <CreateQueueContext.Provider logic={logic}>
      {children}
    </CreateQueueContext.Provider>
  );
}
