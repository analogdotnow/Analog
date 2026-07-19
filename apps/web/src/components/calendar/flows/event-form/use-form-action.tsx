import * as React from "react";

import { jotaiStore } from "@/atoms/store";
import { useCreateAction } from "@/components/calendar/flows/create-event/use-create-action";
import { useUpdateAction } from "@/components/calendar/flows/update-event/use-update-action";
import { formAtom } from "@/components/event-form/atoms/form";
import { FormValues } from "@/components/event-form/utils/schema";
import { toCalendarEvent } from "@/components/event-form/utils/transform/output";
import type { CalendarEvent } from "@/lib/interfaces";
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
  const actorRef = EventFormStateContext.useActorRef();

  const createAction = useCreateAction();
  const updateAction = useUpdateAction();

  const save = React.useCallback(
    async (values: FormValues, notify?: boolean, onSuccess?: () => void) => {
      const event = toCalendarEvent({ values });

      if (values.type === "draft") {
        await createAction({
          event,
          notify,
          onSuccess,
        });

        return;
      }

      // The snapshot the form hydrated from, frozen while the form is dirty.
      // Diffing against it (instead of the current db event) keeps remote
      // edits out of the payload and sends ITS etag, so the provider can 412
      // on true conflicts. A mismatched id means the form has since loaded
      // another event (selection changed mid-save); no snapshot exists then.
      const snapshot = jotaiStore.get(formAtom).event;
      const previous = snapshot?.id === event.id ? snapshot : undefined;

      await updateAction({
        event,
        previous,
        notify,
        onSuccess: (saved) => {
          // Advance the frozen baseline to the canonical saved event so the
          // next save diffs against the server's state and carries its fresh
          // etag; keeping the old snapshot would replay this save's fields
          // and 412 against our own write. Values are left untouched — the
          // live form is their source while editing continues.
          if (saved) {
            jotaiStore.set(formAtom, (prev) => {
              if (prev.event?.id !== saved.id) {
                return prev;
              }

              return { ...prev, event: saved };
            });
          }

          onSuccess?.();
        },
      });

      actorRef.send({ type: "SAVE", notify });
    },
    [actorRef, createAction, updateAction],
  );

  return save;
}
