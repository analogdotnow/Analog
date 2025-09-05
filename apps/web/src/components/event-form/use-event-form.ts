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
import { hasEventChanged } from "@/components/calendar/flows/event-form/utils";
import { useActorRefSubscription } from "@/components/calendar/flows/use-actor-subscription";
import { useDefaultCalendar } from "@/components/calendar/hooks/use-default-calendar";
import {
  createDefaultEvent,
  parseCalendarEvent,
  parseDraftEvent,
  toCalendarEvent,
} from "@/components/event-form/utils";
import { isDraftEvent } from "@/lib/utils/calendar";
import {
  requiresAttendeeConfirmation,
  requiresRecurrenceConfirmation,
} from "@/lib/utils/events";
import {
  FormValues,
  defaultFormMeta,
  formSchema,
  initialValues,
  useAppForm,
} from "./form";

export function useEventForm() {
  const actorRef = EventFormStateContext.useActorRef();
  const settings = useAtomValue(calendarSettingsAtom);

  const defaultCalendar = useDefaultCalendar();

  const snapshotRef = React.useRef<SnapshotFrom<EventFormMachine> | null>(null);

  const [defaultValues, setDefaultValues] = React.useState<FormValues>(
    () => initialValues,
  );
  const [disabled, setDisabled] = React.useState(false);
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

      await saveAction(value, meta?.sendUpdate);
    },
    listeners: {
      onBlur: async ({ formApi }) => {
        // If unchanged or invalid, do nothing
        if (
          !formApi.state.isValid ||
          (formApi.state.isDefaultValue && !formApi.state.isDirty)
        ) {
          return;
        }

        if (
          requiresAttendeeConfirmation(formApi.state.values.attendees) ||
          requiresRecurrenceConfirmation(formApi.state.values?.recurringEventId)
        ) {
          return;
        }

        await formApi.handleSubmit();
      },
    },
  });

  useActorRefSubscription({
    actorRef,
    onUpdate: (snapshot) => {
      if (!snapshot.matches("ready")) {
        return;
      }

      if (!defaultCalendar) {
        return;
      }

      const event = snapshot.context.formEvent;
      const previousEvent = snapshotRef.current?.context.formEvent ?? null;

      if (!event || !hasEventChanged(event, previousEvent)) {
        return;
      }

      snapshotRef.current = snapshot;

      if (isDraftEvent(event)) {
        setDefaultValues(
          parseDraftEvent({
            event,
            defaultCalendar,
            settings,
          }),
        );
        setDisabled(event.readOnly);
        return;
      }

      setDefaultValues(parseCalendarEvent({ event, settings }));
      setDisabled(event.readOnly);
    },
  });

  React.useEffect(() => {
    if (!defaultCalendar || snapshotRef.current) {
      return;
    }

    const values = createDefaultEvent({ settings, defaultCalendar });
    formAction(toCalendarEvent({ values }));
  }, [defaultCalendar, settings, form, formAction]);

  return {
    form,
    disabled,
  };
}
