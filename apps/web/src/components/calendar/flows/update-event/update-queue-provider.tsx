import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";

import { removeOptimisticActionAtom } from "@/components/calendar/hooks/optimistic-actions";
import {
  buildUpdateEvent,
  buildUpdateSeries,
} from "@/components/calendar/hooks/update-utils";
import { useUpdateEventMutation } from "@/components/calendar/hooks/use-event-mutations";
import { useEventQueryParams } from "@/components/calendar/hooks/use-events";
import { createUpdateQueueMachine, type UpdateQueueItem } from "./update-queue";

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
  const queryClient = useQueryClient();
  const { queryKey } = useEventQueryParams();
  const updateMutation = useUpdateEventMutation();
  const removeOptimisticAction = useSetAtom(removeOptimisticActionAtom);

  const updateEvent = React.useCallback(
    async (item: UpdateQueueItem) => {
      const events = queryClient.getQueryData(queryKey)?.events ?? [];
      const prevEvent = events.find((e) => e.id === item.event.id);

      if (!prevEvent) {
        throw new Error("Previous event not found");
      }

      const sendUpdate = item.notify ?? undefined;

      if (item.event.recurringEventId && item.scope === "series") {
        updateMutation.mutate(
          buildUpdateSeries(item.event, prevEvent, { sendUpdate }),
          {
            onSuccess: () => {
              removeOptimisticAction(item.optimisticId);
            },
          },
        );

        return;
      }

      updateMutation.mutate(
        buildUpdateEvent(item.event, prevEvent, { sendUpdate }),
        {
          onSuccess: () => {
            removeOptimisticAction(item.optimisticId);
          },
        },
      );
    },
    [queryClient, queryKey, updateMutation, removeOptimisticAction],
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
