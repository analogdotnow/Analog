"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { SnapshotFrom } from "xstate";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { EventFormMachine } from "@/components/calendar/flows/event-form/event-form-state";
import { EventFormStateContext } from "@/components/calendar/flows/event-form/event-form-state-provider";
import {
  useFormAction,
  useSaveAction,
} from "@/components/calendar/flows/event-form/use-form-action";
import { useActorRefSubscription } from "@/components/calendar/flows/use-actor-subscription";
import { useDefaultCalendar } from "@/components/calendar/hooks/use-default-calendar";
import { createDefaultEvent } from "@/components/event-form/utils/defaults";
import { toCalendarEvent } from "@/components/event-form/utils/transform/output";
import {
  requiresAttendeeConfirmation,
  requiresRecurrenceConfirmation,
} from "@/lib/utils/events";
import { defaultValuesAtom } from "../atoms/form";
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

  const snapshotRef = React.useRef<SnapshotFrom<EventFormMachine> | null>(null);

  const defaultValues = useAtomValue(defaultValuesAtom);
  const saveAction = useSaveAction();
  const formAction = useFormAction();

  const form = useAppForm({
    defaultValues,
    onSubmitMeta: defaultFormMeta,
    validators: {
      onBlur: formSchema,
    },
    onSubmit: async ({ value, formApi, meta }) => {
      // If unchanged, do nothing
      if (!formApi.state.isDirty && formApi.state.isDefaultValue) {
        return;
      }

      console.log(
        formApi.state.isDirty,
        formApi.state.isDefaultValue,
        formApi.state.isPristine,
        formApi.state.isValid,
      );

      // await saveAction(value, meta?.sendUpdate);
    },
    listeners: {
      onBlur: async ({ formApi }) => {
        // If unchanged or invalid, do nothing
        if (!formApi.state.isValid || formApi.state.isPristine) {
          return;
        }

        if (requiresConfirmation(formApi.state.values)) {
          return;
        }

        await formApi.handleSubmit();
      },
    },
  });

  const updateFormState = useUpdateFormState();
  
  useActorRefSubscription({
    actorRef,
    onUpdate: async (snapshot) => {
      if (!snapshot.matches("loading")) {
        return;
      }

      const event = snapshot.context.formEvent;

      if (!event) {
        return;
      }
      
      await updateFormState(event, form);
    },
  });

  React.useEffect(() => {
    if (!defaultCalendar || snapshotRef.current) {
      return;
    }

    const values = createDefaultEvent({ settings, defaultCalendar });

    formAction(toCalendarEvent({ values }));
  }, [defaultCalendar, settings, form, formAction]);

  return form;
}
