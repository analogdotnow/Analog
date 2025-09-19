"use client";

import * as React from "react";
import { useAtom, useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { EventFormStateContext } from "@/components/calendar/flows/event-form/event-form-state-provider";
import {
  useFormAction,
  useSaveAction,
} from "@/components/calendar/flows/event-form/use-form-action";
import { useActorRefSubscription } from "@/components/calendar/flows/use-actor-subscription";
import { useDefaultCalendar } from "@/components/calendar/hooks/use-default-calendar";
import { getDefaultEvent } from "@/components/event-form/utils/defaults";
import {
  requiresAttendeeConfirmation,
  requiresRecurrenceConfirmation,
} from "@/lib/utils/events";
import { defaultValuesAtom, formAtom, isPristineAtom } from "../atoms/form";
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
  const settings = useAtomValue(calendarSettingsAtom);

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

  useActorRefSubscription({
    actorRef,
    onUpdate: async (snapshot) => {
      if (!snapshot.matches("loading") || !defaultCalendar) {
        return;
      }

      const event = snapshot.context.formEvent!;

      if (formState.event?.id !== event.id || isPristine) {
        setIsPristine(true);
        await updateFormState(event);

        return;
      }
    },
  });

  React.useEffect(() => {
    if (!defaultCalendar || form.state.values.calendar.calendarId !== "") {
      return;
    }

    const event = getDefaultEvent({ settings, defaultCalendar });

    formAction(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCalendar]);

  return form;
}

export type Form = ReturnType<typeof useEventForm>;
