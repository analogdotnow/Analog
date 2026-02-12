"use client";

import * as React from "react";
import { useAtom, useAtomValue } from "jotai";

import { EventFormStateContext } from "@/components/calendar/flows/event-form/event-form-state-provider";
import {
  useFormAction,
  useSaveAction,
} from "@/components/calendar/flows/event-form/use-form-action";
import {
  defaultValuesAtom,
  formAtom,
  isPristineAtom,
} from "@/components/event-form/atoms/form";
import { getDefaultEvent } from "@/components/event-form/utils/defaults";
import { useDefaultCalendar } from "@/hooks/calendar/use-default-calendar";
import { getEventById } from "@/lib/db";
import {
  requiresAttendeeConfirmation,
  requiresRecurrenceConfirmation,
} from "@/lib/utils/events";
import {
  useDefaultEventDuration,
  useDefaultTimeZone,
  useSelectedEventList,
} from "@/store/hooks";
import { defaultFormMeta } from "./defaults";
import { useAppForm } from "./form";
import { FormValues, formSchema } from "./schema";
import { useUpdateFormState } from "./use-update-form-state";

function requiresConfirmation(values: FormValues) {
  return (
    requiresAttendeeConfirmation(values.attendees) ||
    requiresRecurrenceConfirmation(values.recurringEventId)
  );
}

export function useEventForm() {
  const actorRef = EventFormStateContext.useActorRef();
  const defaultTimeZone = useDefaultTimeZone();
  const defaultEventDuration = useDefaultEventDuration();
  const selectedEventId = useSelectedEventList()[0] ?? null;

  const defaultCalendar = useDefaultCalendar();

  const defaultValues = useAtomValue(defaultValuesAtom);
  const formState = useAtomValue(formAtom);
  const saveAction = useSaveAction();
  const formAction = useFormAction();
  const [isPristine, setIsPristine] = useAtom(isPristineAtom);

  const form = useAppForm({
    defaultValues,
    onSubmitMeta: defaultFormMeta,
    validators: {
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value, meta }) => {
      if (isPristine) {
        return;
      }

      await saveAction(value, meta?.sendUpdate, () => {
        actorRef.send({ type: "CONFIRMED" });
        setIsPristine(true);
      });
    },
    listeners: {
      onBlur: async ({ formApi }) => {
        // If invalid, do nothing
        if (
          !formApi.state.isValid ||
          requiresConfirmation(formApi.state.values)
        ) {
          return;
        }

        await formApi.handleSubmit();
      },
      onChange: async ({ formApi }) => {
        if (formApi.state.isPristine) {
          return;
        }

        setIsPristine(false);
      },
    },
  });

  React.useEffect(() => {
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  const updateFormState = useUpdateFormState();

  const loadingEvent = EventFormStateContext.useSelector((snapshot) =>
    snapshot.matches("loading") ? snapshot.context.formEvent : null,
  );

  // Safety net: if the initial LOAD is missed (e.g. window expands late), refetch
  // the selected event by id and force a LOAD so the form hydrates on first try.
  React.useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    const snapshot = actorRef.getSnapshot();
    const currentId = snapshot.context.formEvent?.id;

    if (snapshot.matches("loading") && currentId === selectedEventId) {
      return;
    }

    void (async () => {
      const event = await getEventById(selectedEventId);

      if (!event) {
        return;
      }

      actorRef.send({ type: "LOAD", item: event });
    })();
  }, [actorRef, selectedEventId]);

  React.useEffect(() => {
    if (!loadingEvent) {
      return;
    }

    // Draft events need default calendar; real events can hydrate without it.
    if (loadingEvent.type === "draft" && !defaultCalendar) {
      return;
    }

    if (formState.event?.id !== loadingEvent.id || isPristine) {
      setIsPristine(true);
      updateFormState(loadingEvent);
    }
  }, [
    loadingEvent,
    defaultCalendar,
    formState.event?.id,
    isPristine,
    setIsPristine,
    updateFormState,
  ]);

  React.useEffect(() => {
    if (!defaultCalendar || form.state.values.calendar.id !== "") {
      return;
    }

    const event = getDefaultEvent({
      defaultCalendar,
      defaultTimeZone,
      defaultEventDuration,
    });

    formAction(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCalendar]);

  return form;
}

export type Form = ReturnType<typeof useEventForm>;
