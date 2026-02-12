import * as React from "react";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";

import { removeOptimisticActionAtom } from "@/hooks/calendar/optimistic-actions";
import { useDeleteEventMutation } from "@/hooks/calendar/use-event-mutations";
import { getEventById } from "@/lib/db";
import { createDeleteQueueMachine, type DeleteQueueItem } from "./delete-queue";

export const DeleteQueueContext = createActorContext(
  createDeleteQueueMachine({
    deleteEvent: async () => {},
    removeOptimisticAction: () => {},
  }),
);

interface DeleteQueueProviderProps {
  children: React.ReactNode;
}

export function DeleteQueueProvider({ children }: DeleteQueueProviderProps) {
  const deleteMutation = useDeleteEventMutation();
  const removeOptimisticAction = useSetAtom(removeOptimisticActionAtom);

  const deleteEvent = React.useCallback(
    async (item: DeleteQueueItem) => {
      const prevEvent = await getEventById(item.event.id);

      if (!prevEvent) {
        if (item.event?.type === "draft") {
          removeOptimisticAction(item.optimisticId);
        }

        return;
      }

      const eventId =
        item.event.recurringEventId && item.scope === "series"
          ? item.event.recurringEventId
          : item.event.id;

      deleteMutation.mutate(
        {
          calendar: item.event.calendar,
          eventId,
          sendUpdate: item.notify,
        },
        {
          onSettled: () => {
            removeOptimisticAction(item.optimisticId);
          },
        },
      );
    },
    [deleteMutation, removeOptimisticAction],
  );

  const logic = React.useMemo(() => {
    return createDeleteQueueMachine({
      deleteEvent,
      removeOptimisticAction,
    });
  }, [deleteEvent, removeOptimisticAction]);

  return (
    <DeleteQueueContext.Provider logic={logic}>
      {children}
    </DeleteQueueContext.Provider>
  );
}
