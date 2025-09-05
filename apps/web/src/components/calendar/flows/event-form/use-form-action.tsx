import * as React from "react";

import { FormValues } from "@/components/event-form/form";
import { toCalendarEvent } from "@/components/event-form/utils";
import type { CalendarEvent } from "@/lib/interfaces";
import { useCreateAction } from "../create-event/use-create-action";
import { useUpdateAction } from "../update-event/use-update-action";
import { EventFormStateContext } from "./event-form-state-provider";

export function useFormAction() {
  const actorRef = EventFormStateContext.useActorRef();

  const update = React.useCallback(
    async (event: CalendarEvent) => {
      actorRef.send({ type: "QUEUE", item: event });
      console.log("queued event", event);
    },
    [actorRef],
  );

  return update;
}

export function useSaveAction() {
  const actorRef = EventFormStateContext.useActorRef();

  const createAction = useCreateAction();
  const updateAction = useUpdateAction();

  const save = React.useCallback(
    async (values: FormValues, notify?: boolean) => {
      if (values.type === "draft") {
        await createAction({
          event: toCalendarEvent({ values }),
          notify,
        });

        return;
      }

      await updateAction({
        event: toCalendarEvent({ values }),
        notify,
      });

      actorRef.send({ type: "SAVE", notify });
    },
    [actorRef, createAction, updateAction],
  );

  return save;
}
