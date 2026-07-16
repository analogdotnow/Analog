import * as React from "react";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";

import { removeOptimisticActionAtom } from "@/hooks/calendar/optimistic-actions";
import { useUpdateEventMutation } from "@/hooks/calendar/use-event-mutations";
import { getEventById } from "@/lib/db";
import { createUpdateQueueMachine, type UpdateQueueItem } from "./update-queue";
import { buildUpdateEvent, buildUpdateSeries, isEmptyUpdate } from "./utils";

export const UpdateQueueContext = createActorContext(
  createUpdateQueueMachine({
    updateEvent: async () => {},
    removeOptimisticAction: () => {},
  }),
);

interface UpdateQueueProviderProps {
  children: React.ReactNode;
}

export function UpdateQueueProvider({ children }: UpdateQueueProviderProps) {
  const updateMutation = useUpdateEventMutation();
  const removeOptimisticAction = useSetAtom(removeOptimisticActionAtom);

  const updateEvent = React.useCallback(
    async (item: UpdateQueueItem) => {
      const prevEvent = await getEventById(item.event.id);

      if (!prevEvent) {
        if (item.event.type !== "draft") {
          throw new Error("Event not found");
        }

        item.onSuccess?.();

        return;
      }

      const payload =
        item.event.recurringEventId && item.scope === "series"
          ? buildUpdateSeries(item.event, prevEvent, {
              sendUpdate: item.notify,
            })
          : buildUpdateEvent(item.event, prevEvent, {
              sendUpdate: item.notify,
            });

      if (isEmptyUpdate(payload)) {
        removeOptimisticAction(item.optimisticId);
        item.onSuccess?.();

        return;
      }

      updateMutation.mutate(payload, {
        onError: () => {
          removeOptimisticAction(item.optimisticId);
        },
        onSuccess: () => {
          // removeOptimisticAction(item.optimisticId);
          item.onSuccess?.();
        },
      });
    },
    [updateMutation, removeOptimisticAction],
  );

  const logic = React.useMemo(() => {
    return createUpdateQueueMachine({
      updateEvent,
      removeOptimisticAction,
    });
  }, [updateEvent, removeOptimisticAction]);

  return (
    <UpdateQueueContext.Provider logic={logic}>
      {children}
    </UpdateQueueContext.Provider>
  );
}
