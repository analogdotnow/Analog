import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { jotaiStore } from "@/atoms/store";
import { formAtom, isPristineAtom } from "@/components/event-form/atoms/form";
import { useUpdateFormValues } from "@/components/event-form/utils/use-update-form-state";
import {
  addOptimisticActionAtom,
  optimisticActionsByEventIdAtom,
  removeDraftOptimisticActionsByEventIdAtom,
} from "@/hooks/calendar/optimistic-actions";
import { getEventById } from "@/lib/db";
import type { CalendarEvent, EventChanges } from "@/lib/interfaces";
import type { WriteLane } from "../write-lane";
import { useWriteLane } from "../write-lane-provider";
import type {
  ReplaceQueueRequest,
  UpdateQueueItem,
  UpdateQueueRequest,
} from "./update-queue";
import { UpdateQueueContext } from "./update-queue-provider";
import { changedFields } from "./utils";

// The event as the user currently sees it: lane state when a write is
// queued, otherwise the draft overlay or the stored event.
async function getOptimisticEvent(lane: WriteLane, eventId: string) {
  if (lane.has(eventId)) {
    return lane.current(eventId);
  }

  const action = jotaiStore.get(optimisticActionsByEventIdAtom)[eventId];

  if (!action) {
    return getEventById(eventId);
  }

  if (action.type === "delete") {
    return undefined;
  }

  return action.event;
}

function applyChanges(
  event: CalendarEvent,
  changes: EventChanges,
): CalendarEvent {
  return Object.assign({}, event, changes, {
    updatedAt: Temporal.Now.instant(),
  });
}

// Drafts only exist as overlays; moving one never reaches the lane.
function setDraftOverlay(event: CalendarEvent) {
  jotaiStore.set(removeDraftOptimisticActionsByEventIdAtom, event.id);
  jotaiStore.set(addOptimisticActionAtom, {
    type: "draft",
    eventId: event.id,
    event,
  });
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
  const lane = useWriteLane();
  const updateFormValues = useUpdateFormValues();

  return React.useCallback(
    async (req: UpdateQueueRequest) => {
      const current = await getOptimisticEvent(lane, req.changes.id);

      if (!current) {
        return;
      }

      const event = applyChanges(current, req.changes);

      if (req.changes.type === "draft") {
        setDraftOverlay(event);

        return;
      }

      lane.preview(event);

      // If the event is in the form and the form is not pristine, patch only
      // the form values: overwriting formAtom.event would bake the deferred
      // change into the diff baseline and silently drop it from the next save.
      if (isInForm(req.changes.id) && !isFormPristine()) {
        await updateFormValues(event, req.changes);

        return;
      }

      const item: UpdateQueueItem = {
        event,
        changes: req.changes,
        scope: req.scope,
        notify: req.notify,
        onSuccess: req.onSuccess,
      };

      actorRef.send({ type: "START", item });
    },
    [actorRef, lane, updateFormValues],
  );
}

export function useUpdateAction() {
  const actorRef = UpdateQueueContext.useActorRef();
  const lane = useWriteLane();

  return React.useCallback(
    async (req: ReplaceQueueRequest) => {
      const previous =
        req.previous ?? (await getOptimisticEvent(lane, req.event.id));

      if (!previous) {
        return;
      }

      const event: CalendarEvent = {
        ...req.event,
        updatedAt: Temporal.Now.instant(),
      };

      lane.preview(event);

      const item: UpdateQueueItem = {
        event,
        changes: changedFields(event, previous),
        scope: req.scope,
        notify: req.notify,
        onSuccess: req.onSuccess,
        onCancel: req.onCancel,
      };

      actorRef.send({ type: "START", item });
    },
    [actorRef, lane],
  );
}
