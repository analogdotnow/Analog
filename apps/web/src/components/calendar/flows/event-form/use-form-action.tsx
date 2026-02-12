import * as React from "react";

import { useCreateAction } from "@/components/calendar/flows/create-event/use-create-action";
import { useUpdateAction } from "@/components/calendar/flows/update-event/use-update-action";
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

      await updateAction({
        event,
        notify,
        onSuccess,
      });

      actorRef.send({ type: "SAVE", notify });
    },
    [actorRef, createAction, updateAction],
  );

  return save;
}
