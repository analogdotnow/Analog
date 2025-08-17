import * as React from "react";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";

import { removeOptimisticActionAtom } from "@/components/calendar/hooks/optimistic-actions";
import { useCreateEventMutation } from "@/components/calendar/hooks/use-event-mutations";
import { createCreateQueueMachine, type CreateQueueItem } from "./create-queue";

export const CreateQueueContext = createActorContext(
  createCreateQueueMachine({
    createEvent: async () => {},
    removeOptimisticAction: () => {},
  }),
);

interface CreateQueueProviderProps {
  children: React.ReactNode;
}

export function CreateQueueProvider({ children }: CreateQueueProviderProps) {
  const createMutation = useCreateEventMutation();
  const removeOptimisticAction = useSetAtom(removeOptimisticActionAtom);

  const createEvent = React.useCallback(
    async (item: CreateQueueItem) => {
      createMutation.mutate(item.event, {
        onSettled: () => {
          removeOptimisticAction(item.optimisticId);
        },
      });
    },
    [createMutation, removeOptimisticAction],
  );

  const logic = React.useMemo(() => {
    return createCreateQueueMachine({
      createEvent,
      removeOptimisticAction,
    });
  }, [createEvent, removeOptimisticAction]);

  return (
    <CreateQueueContext.Provider logic={logic}>
      {children}
    </CreateQueueContext.Provider>
  );
}
