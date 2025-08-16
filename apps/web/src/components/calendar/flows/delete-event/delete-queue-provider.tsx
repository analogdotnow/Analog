import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";

import { removeOptimisticActionAtom } from "@/components/calendar/hooks/optimistic-actions";
import { useDeleteEventMutation } from "@/components/calendar/hooks/use-event-mutations";
import { useEventQueryParams } from "@/components/calendar/hooks/use-events";
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
  const queryClient = useQueryClient();
  const { queryKey } = useEventQueryParams();
  const deleteMutation = useDeleteEventMutation();
  const removeOptimisticAction = useSetAtom(removeOptimisticActionAtom);

  const deleteEvent = React.useCallback(
    async (item: DeleteQueueItem) => {
      const events = queryClient.getQueryData(queryKey)?.events ?? [];
      const prevEvent = events.find((e) => e.id === item.event.id);

      if (!prevEvent) {
        throw new Error("Previous event not found");
      }

      const sendUpdate = item.notify ?? undefined;

      const eventId =
        item.event.recurringEventId && item.scope === "series"
          ? item.event.recurringEventId
          : item.event.id;

      deleteMutation.mutate(
        {
          accountId: item.event.accountId,
          calendarId: item.event.calendarId,
          eventId,
          sendUpdate,
        },
        {
          onSettled: () => {
            removeOptimisticAction(item.optimisticId);
          },
        },
      );
    },
    [queryClient, queryKey, deleteMutation, removeOptimisticAction],
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
