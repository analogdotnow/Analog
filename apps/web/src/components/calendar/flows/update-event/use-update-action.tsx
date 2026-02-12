import * as React from "react";
import { useSetAtom } from "jotai";
import { Temporal } from "temporal-polyfill";

import { jotaiStore } from "@/atoms/store";
import { formAtom, isPristineAtom } from "@/components/event-form/atoms/form";
import { useUpdateFormState } from "@/components/event-form/utils/use-update-form-state";
import {
  addOptimisticActionAtom,
  generateOptimisticId,
  optimisticActionsByEventIdAtom,
  removeDraftOptimisticActionsByEventIdAtom,
} from "@/hooks/calendar/optimistic-actions";
import { getEventById } from "@/lib/db";
import { CalendarEvent } from "@/lib/interfaces";
import type {
  ReplaceQueueRequest,
  UpdateQueueItem,
  UpdateQueueRequest,
} from "./update-queue";
import { UpdateQueueContext } from "./update-queue-provider";

async function getOptimisticEvent(eventId: string) {
  const optimisticActions = jotaiStore.get(optimisticActionsByEventIdAtom);

  if (!optimisticActions[eventId]) {
    return getEventById(eventId);
  }

  if (optimisticActions[eventId].type === "delete") {
    return undefined;
  }

  return optimisticActions[eventId].event;
}

async function constructEvent(req: UpdateQueueRequest) {
  const event = await getOptimisticEvent(req.changes.id);

  if (!event) {
    return;
  }

  return {
    ...event,
    ...req.changes,
    updatedAt: Temporal.Now.instant(),
  } as CalendarEvent;
}

function useOptimisticUpdateAction() {
  const addOptimisticAction = useSetAtom(addOptimisticActionAtom);
  const removeDraftOptimisticActionsByEventId = useSetAtom(
    removeDraftOptimisticActionsByEventIdAtom,
  );

  return React.useCallback(
    async (
      optimisticId: string,
      event: CalendarEvent,
      type?: "draft" | "event",
    ) => {
      React.startTransition(() => {
        if (type === "draft") {
          removeDraftOptimisticActionsByEventId(event.id);

          addOptimisticAction({
            id: optimisticId,
            type: "draft",
            eventId: event.id,
            event,
          });

          return;
        }

        addOptimisticAction({
          id: optimisticId,
          type: "update",
          eventId: event.id,
          event,
        });
      });

      return optimisticId;
    },
    [addOptimisticAction, removeDraftOptimisticActionsByEventId],
  );
}

function isInForm(eventId: string) {
  const formState = jotaiStore.get(formAtom);

  return formState.event?.id === eventId;
}

function isFormPristine() {
  return jotaiStore.get(isPristineAtom);
}

export function usePartialUpdateAction() {
  const actorRef = UpdateQueueContext.useActorRef();
  const updateFormState = useUpdateFormState();
  const updateOptimisticUpdate = useOptimisticUpdateAction();

  return React.useCallback(
    async (req: UpdateQueueRequest) => {
      const optimisticId = generateOptimisticId();

      const event = await constructEvent(req);

      if (!event) {
        // TODO: if the event is not found
        return;
      }

      // If the event is in the form and the form is not pristine, patch the form state
      if (isInForm(req.changes.id) && !isFormPristine()) {
        await updateFormState(event);
        await updateOptimisticUpdate(optimisticId, event, req.changes.type);

        return optimisticId;
      }

      await updateOptimisticUpdate(optimisticId, event, req.changes.type);

      const item: UpdateQueueItem = {
        optimisticId,
        event,
        scope: req.scope,
        notify: req.notify,
        onSuccess: req.onSuccess,
      };

      actorRef.send({ type: "START", item });

      // Return optimistic id to allow callers to await completion externally
      return optimisticId;
    },
    [actorRef, updateFormState, updateOptimisticUpdate],
  );
}

export function useUpdateAction() {
  const actorRef = UpdateQueueContext.useActorRef();
  const updateOptimisticUpdate = useOptimisticUpdateAction();

  return React.useCallback(
    async (req: ReplaceQueueRequest) => {
      const optimisticId = generateOptimisticId();

      const event: CalendarEvent = {
        ...req.event,
        updatedAt: Temporal.Now.instant(),
      };

      updateOptimisticUpdate(optimisticId, event, req.event.type);

      const item: UpdateQueueItem = {
        optimisticId,
        event,
        scope: req.scope,
        notify: req.notify,
        onSuccess: req.onSuccess,
      };

      actorRef.send({ type: "START", item });

      // Return optimistic id to allow callers to await completion externally
      return optimisticId;
    },
    [actorRef, updateOptimisticUpdate],
  );
}
