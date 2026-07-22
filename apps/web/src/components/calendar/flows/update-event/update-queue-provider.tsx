import * as React from "react";
import { createActorContext } from "@xstate/react";
import { useSetAtom } from "jotai";
import { toast } from "sonner";

import { removeOptimisticActionAtom } from "@/hooks/calendar/optimistic-actions";
import { useUpdateEventMutation } from "@/hooks/calendar/use-event-mutations";
import { getEventById } from "@/lib/db";
import { createUpdateQueueMachine, type UpdateQueueItem } from "./update-queue";
import {
  buildUpdateEvent,
  buildUpdateSeries,
  isEmptyUpdate,
  SeriesUpdateBlockedError,
  type UpdateEventPayload,
} from "./utils";

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
      const prevEvent = item.previous ?? (await getEventById(item.event.id));

      if (!prevEvent) {
        if (item.event.type !== "draft") {
          throw new Error("Event not found");
        }

        item.onSuccess?.();

        return;
      }

      const submit = (payload: UpdateEventPayload) => {
        if (isEmptyUpdate(payload)) {
          removeOptimisticAction(item.optimisticId);
          item.onSuccess?.();

          return;
        }

        updateMutation.mutate(payload, {
          onError: () => {
            removeOptimisticAction(item.optimisticId);
          },
          onSuccess: (data) => {
            // removeOptimisticAction(item.optimisticId);
            item.onSuccess?.(data.event);
          },
        });
      };

      if (item.event.recurringEventId && item.scope === "series") {
        // Whole-series edits target the master with only the changed fields;
        // sending an occurrence's dates under the master ID re-anchors the
        // series on the provider side.
        const masterEvent = await getEventById(item.event.recurringEventId);

        if (!masterEvent) {
          toast.error("The series this event belongs to isn't loaded yet.");
          removeOptimisticAction(item.optimisticId);

          return;
        }

        try {
          submit(
            buildUpdateSeries(item.event, prevEvent, masterEvent, {
              sendUpdate: item.notify,
            }),
          );
        } catch (error) {
          if (!(error instanceof SeriesUpdateBlockedError)) {
            throw error;
          }

          toast.error(error.message);
          removeOptimisticAction(item.optimisticId);
        }

        return;
      }

      submit(
        buildUpdateEvent(item.event, prevEvent, { sendUpdate: item.notify }),
      );
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
