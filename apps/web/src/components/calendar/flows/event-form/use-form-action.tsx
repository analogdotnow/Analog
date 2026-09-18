import * as React from "react";
import { useSetAtom } from "jotai";

import { jotaiStore } from "@/atoms/store";
import { useCreateAction } from "@/components/calendar/flows/create-event/use-create-action";
import { useUpdateAction } from "@/components/calendar/flows/update-event/use-update-action";
import {
  deferredStageTokensAtom,
  formAtom,
  isPristineAtom,
  pendingFieldPatchAtom,
} from "@/components/event-form/atoms/form";
import { FormValues } from "@/components/event-form/utils/schema";
import { toCalendarEvent } from "@/components/event-form/utils/transform/output";
import { releaseDeferredEdits } from "@/components/event-form/utils/use-update-form-state";
import type { CalendarEvent } from "@/lib/interfaces";
import type { OnWriteSuccess } from "../write-lane";
import { useWriteLane } from "../write-lane-provider";
import { EventFormStateContext } from "./event-form-state-provider";

export function useFormAction() {
  const actorRef = EventFormStateContext.useActorRef();

  const update = React.useCallback(
    async (event: CalendarEvent) => {
      actorRef.send({ type: "LOAD", item: event });
    },
    [actorRef],
  );

  return update;
}

export function useResetFormAction() {
  const actorRef = EventFormStateContext.useActorRef();

  const save = React.useCallback(
    async (values: FormValues) => {
      const event = toCalendarEvent({ values });

      actorRef.send({ type: "LOAD", item: event });
    },
    [actorRef],
  );

  return save;
}

export function useSaveAction() {
  const lane = useWriteLane();
  const createAction = useCreateAction();
  const updateAction = useUpdateAction();

  const save = React.useCallback(
    async (
      values: FormValues,
      notify?: boolean,
      onSuccess?: OnWriteSuccess,
      onCancel?: () => void,
    ) => {
      if (values.type === "draft") {
        await createAction({
          event: toCalendarEvent({ values }),
          notify,
          onSuccess,
          onCancel,
        });

        return;
      }

      // The snapshot the form hydrated from. Diffing against it (instead of
      // the current db event) keeps remote edits out of the payload, and
      // building the event on top of it carries the fields the form does not
      // edit (color, metadata) so they are not seen as cleared. A mismatched
      // id means the form has since loaded another event (selection changed
      // mid-save); no snapshot exists then.
      const snapshot = jotaiStore.get(formAtom).event;
      const previous = snapshot?.id === values.id ? snapshot : undefined;
      // The edits deferred into the form so far are dirty fields of `values`,
      // so this save carries them; their own previews are redundant once it
      // is staged.
      const deferred = jotaiStore.get(deferredStageTokensAtom);

      const staged = await updateAction({
        event: toCalendarEvent({ values, event: previous }),
        previous,
        notify,
        onSuccess,
        onCancel,
      });

      if (staged) {
        releaseDeferredEdits(lane, deferred);
      }
    },
    [lane, createAction, updateAction],
  );

  return save;
}

interface Resettable {
  reset: () => void;
}

// Drops every unsaved edit, including ones deferred into the form from the
// calendar, and puts the calendar back to what is actually written.
export function useDiscardAction() {
  const lane = useWriteLane();
  const setPendingFieldPatch = useSetAtom(pendingFieldPatchAtom);
  const setIsPristine = useSetAtom(isPristineAtom);

  return React.useCallback(
    (form: Resettable) => {
      form.reset();
      setPendingFieldPatch(null);
      setIsPristine(true);
      releaseDeferredEdits(lane);
    },
    [lane, setPendingFieldPatch, setIsPristine],
  );
}
