"use client";

import * as React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { EventFormStateContext } from "@/components/calendar/flows/event-form/event-form-state-provider";
import { getDifferences } from "@/components/calendar/flows/event-form/merge-changes";
import {
  useDiscardAction,
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
import type { CalendarEvent } from "@/lib/interfaces";
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
import {
  patchableFields,
  useParseFormValues,
  useUpdateFormState,
} from "./use-update-form-state";

function requiresConfirmation(values: FormValues) {
  return (
    requiresAttendeeConfirmation(values.attendees) ||
    requiresRecurrenceConfirmation(values.recurringEventId)
  );
}

interface ApplyFieldPatchOptions {
  // Deferred edits are user intent and mark the field dirty; merged external
  // state must not, or it would be treated as the user's edit from then on.
  dontUpdateMeta: boolean;
}

function applyFieldPatch(
  form: Form,
  values: FormValues,
  keys: FormPatchKey[],
  options: ApplyFieldPatchOptions,
) {
  for (const key of keys) {
    switch (key) {
      case "title":
        form.setFieldValue("title", values.title, options);
        break;
      case "description":
        form.setFieldValue("description", values.description, options);
        break;
      case "location":
        form.setFieldValue("location", values.location, options);
        break;
      case "start":
        form.setFieldValue("start", values.start, options);
        break;
      case "end":
        form.setFieldValue("end", values.end, options);
        break;
      case "allDay":
        form.setFieldValue("allDay", values.allDay, options);
        break;
      case "availability":
        form.setFieldValue("availability", values.availability, options);
        break;
      case "visibility":
        form.setFieldValue("visibility", values.visibility, options);
        break;
      case "attendees":
        form.setFieldValue("attendees", values.attendees, options);
        break;
      case "response":
        form.setFieldValue("response", values.response, options);
        break;
      case "recurrence":
        form.setFieldValue("recurrence", values.recurrence, options);
        break;
      case "recurringEventId":
        form.setFieldValue(
          "recurringEventId",
          values.recurringEventId,
          options,
        );
        break;
      case "conference":
        form.setFieldValue("conference", values.conference, options);
        break;
      case "calendar":
        form.setFieldValue("calendar", values.calendar, options);
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
  const setFormState = useSetAtom(formAtom);
  const saveAction = useSaveAction();
  const formAction = useFormAction();
  const discardAction = useDiscardAction();
  const [isPristine, setIsPristine] = useAtom(isPristineAtom);
  const [pendingFieldPatch, setPendingFieldPatch] = useAtom(
    pendingFieldPatchAtom,
  );

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

      await saveAction(
        value,
        meta?.sendUpdate,
        (saved) => {
          // Edits made while the save was in flight must not be marked clean:
          // the pristine guard above would silently drop them on the next blur.
          if (getDifferences(value, formApi.state.values).length === 0) {
            setIsPristine(true);
          }

          // Resync from the server copy: a pristine form rehydrates, a dirty
          // one merges its untouched fields (see the hydration effect).
          if (saved) {
            actorRef.send({ type: "LOAD", item: saved });
          }
        },
        () => discardAction(formApi),
      );
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

  // A pending field patch is an edit deferred into this dirty form; apply
  // just those fields so the user's in-progress edits survive.
  React.useEffect(() => {
    if (!pendingFieldPatch) {
      return;
    }

    setPendingFieldPatch(null);
    applyFieldPatch(form, pendingFieldPatch.values, pendingFieldPatch.keys, {
      dontUpdateMeta: false,
    });
  }, [form, pendingFieldPatch, setPendingFieldPatch]);

  const updateFormState = useUpdateFormState();
  const parseValues = useParseFormValues();

  const loadingEvent = EventFormStateContext.useSelector((snapshot) =>
    snapshot.matches("loading") ? snapshot.context.formEvent : null,
  );
  // The last event hydrated or merged. Compared by identity instead of
  // formAtom.event: a re-key writes the returned event into the atom before
  // the save reports it, which must not pass for a hydration.
  const hydratedRef = React.useRef<CalendarEvent | null>(null);

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
    if (!loadingEvent || hydratedRef.current === loadingEvent) {
      return;
    }

    // Draft events need default calendar; real events can hydrate without it.
    if (loadingEvent.type === "draft" && !defaultCalendar) {
      return;
    }

    hydratedRef.current = loadingEvent;

    if (formState.event?.id !== loadingEvent.id || isPristine) {
      setIsPristine(true);
      form.reset(updateFormState(loadingEvent));

      return;
    }

    // Dirty form, same event: the incoming event becomes the diff baseline
    // and fills every field the user has not edited; dirty fields keep the
    // user's value and win on the next save. Defaults move with the baseline
    // (TanStack's update() leaves a touched form's values alone). Identity
    // is not a field the user edits, so a create's returned id and type are
    // always taken.
    const values = parseValues(loadingEvent);

    setFormState({ event: loadingEvent, values });
    form.setFieldValue("id", values.id, { dontUpdateMeta: true });
    form.setFieldValue("type", values.type, { dontUpdateMeta: true });
    applyFieldPatch(
      form,
      values,
      patchableFields.filter((key) => !form.getFieldMeta(key)?.isDirty),
      { dontUpdateMeta: true },
    );
  }, [
    loadingEvent,
    defaultCalendar,
    formState.event,
    isPristine,
    setIsPristine,
    setFormState,
    updateFormState,
    parseValues,
    form,
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
