"use client";

import * as React from "react";
import { useAtom, useAtomValue } from "jotai";

import { jotaiStore } from "@/atoms/store";
import { EventFormStateContext } from "@/components/calendar/flows/event-form/event-form-state-provider";
import { getDifferences } from "@/components/calendar/flows/event-form/merge-changes";
import {
  useFormAction,
  useSaveAction,
} from "@/components/calendar/flows/event-form/use-form-action";
import {
  defaultValuesAtom,
  formAtom,
  isPristineAtom,
  pendingFieldPatchAtom,
  type FormPatchKey,
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

function applyFieldPatch(form: Form, values: FormValues, keys: FormPatchKey[]) {
  for (const key of keys) {
    switch (key) {
      case "title":
        form.setFieldValue("title", values.title);
        break;
      case "description":
        form.setFieldValue("description", values.description);
        break;
      case "location":
        form.setFieldValue("location", values.location);
        break;
      case "start":
        form.setFieldValue("start", values.start);
        break;
      case "end":
        form.setFieldValue("end", values.end);
        break;
      case "allDay":
        form.setFieldValue("allDay", values.allDay);
        break;
      case "availability":
        form.setFieldValue("availability", values.availability);
        break;
      case "visibility":
        form.setFieldValue("visibility", values.visibility);
        break;
      case "attendees":
        form.setFieldValue("attendees", values.attendees);
        break;
      case "response":
        form.setFieldValue("response", values.response);
        break;
      case "recurrence":
        form.setFieldValue("recurrence", values.recurrence);
        break;
      case "recurringEventId":
        form.setFieldValue("recurringEventId", values.recurringEventId);
        break;
      case "conference":
        form.setFieldValue("conference", values.conference);
        break;
      case "calendar":
        form.setFieldValue("calendar", values.calendar);
        break;
      default: {
        const unhandled: never = key;
        throw new Error(`Unhandled form field: ${unhandled}`);
      }
    }
  }
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
    onSubmit: async ({ value, formApi, meta }) => {
      if (isPristine) {
        return;
      }

      await saveAction(value, meta?.sendUpdate, () => {
        actorRef.send({ type: "CONFIRMED" });

        // Edits made while the save was in flight must not be marked clean:
        // the pristine guard above would silently drop them on the next blur.
        if (getDifferences(value, formApi.state.values).length === 0) {
          setIsPristine(true);
        }
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

  // Keyed on values, not the whole form state: a successful save advances
  // formAtom.event (the diff baseline) without touching values, and resetting
  // then would wipe anything typed since the save was fired.
  React.useEffect(() => {
    // A pending field patch is an edit deferred into this dirty form; apply
    // just those fields so the user's in-progress edits survive — a full
    // reset would restore defaultValues and wipe them.
    const patch = jotaiStore.get(pendingFieldPatchAtom);

    if (patch) {
      jotaiStore.set(pendingFieldPatchAtom, null);
      applyFieldPatch(form, formState.values, patch);

      return;
    }

    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.values]);

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
