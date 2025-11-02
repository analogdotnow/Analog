import * as React from "react";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";

import { removeOptimisticActionAtom } from "@/components/calendar/hooks/optimistic-actions";
import { useDeleteEventMutation } from "@/components/calendar/hooks/use-event-mutations";
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
        // TODO: draft events are not drafts when they get here
        removeOptimisticAction(item.optimisticId);

        return;
      }

      const eventId =
        item.event.recurringEventId && item.scope === "series"
          ? item.event.recurringEventId
          : item.event.id;

      deleteMutation.mutate(
        {
          accountId: item.event.accountId,
          calendarId: item.event.calendarId,
          eventId,
          sendUpdate: item.notify,
        },
        {
          onSettled: () => {
            removeOptimisticAction(item.event.id);
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
