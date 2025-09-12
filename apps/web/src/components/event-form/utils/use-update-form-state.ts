import * as React from "react";
import { useAtom, useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useDefaultCalendar } from "@/components/calendar/hooks/use-default-calendar";
import type { CalendarEvent } from "@/lib/interfaces";
import { mergeChanges } from "../../calendar/flows/event-form/merge-changes";
import { formAtom } from "../atoms/form";
import { parseFormValues } from "./transform/input";
import { FormValues } from "./schema";

interface FormHandle {
  reset: () => void;
  handleSubmit: () => Promise<void>;
}

export function useUpdateFormState() {
  const defaultCalendar = useDefaultCalendar();
  const settings = useAtomValue(calendarSettingsAtom);

  const [formState, setFormState] = useAtom(formAtom);

  return React.useCallback(
    async (event: CalendarEvent, form: FormHandle, values: FormValues) => {
      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      if (!formState.event || formState.event.id !== event.id) {
        setFormState({
          event,
          initialValues: parseFormValues(event, defaultCalendar, settings),
          values: parseFormValues(event, defaultCalendar, settings),
          state: "default",
        });
        
        await form.handleSubmit();
        form.reset();

        return;
      }

      const updatedValues = mergeChanges({
        form: {
          initialValues: formState.initialValues,
          defaultValues: formState.values,
          values,
          event: formState.event,
        },
        update: {
          event,
          values: parseFormValues(event, defaultCalendar, settings),
        },
      });

      console.log("UPDATED VALUES", updatedValues.values.title);

      setFormState({
        event,
        initialValues: parseFormValues(event, defaultCalendar, settings),
        values: updatedValues.values,
        state: updatedValues.state,
      });

      form.reset();

      return;
    },
    [defaultCalendar, formState.event, formState.values, setFormState, settings],
  );
}
