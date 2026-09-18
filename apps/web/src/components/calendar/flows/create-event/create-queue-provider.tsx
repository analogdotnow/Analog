import * as React from "react";
import { createActorContext } from "@xstate/react";

import { jotaiStore } from "@/atoms/store";
import { addOptimisticActionAtom } from "@/hooks/calendar/optimistic-actions";
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
            token: item.token,
          });
        },
        cancel: (item) => {
          lane.unstage(item.token);
          // The create never went out, so the event is a draft again and
          // must stay visible on the calendar like any other draft.
          jotaiStore.set(addOptimisticActionAtom, {
            type: "draft",
            eventId: item.event.id,
            event: { ...item.event, type: "draft" },
          });
          item.onCancel?.();
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
