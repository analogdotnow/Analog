import * as React from "react";
import { useAtom, useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useDefaultCalendar } from "@/components/calendar/hooks/use-default-calendar";
import type { CalendarEvent } from "@/lib/interfaces";
import { mergeChanges } from "../../calendar/flows/event-form/merge-changes";
import { formAtom } from "../atoms/form";
import { parseFormValues } from "./transform/input";

interface FormHandle {
  reset: () => void;
  handleSubmit: () => Promise<void>;
}

export function useUpdateFormState() {
  const defaultCalendar = useDefaultCalendar();
  const settings = useAtomValue(calendarSettingsAtom);

  const [formState, setFormState] = useAtom(formAtom);

  return React.useCallback(
    async (event: CalendarEvent, form: FormHandle) => {
      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      if (!formState.event) {
        setFormState({
          event,
          values: parseFormValues(event, defaultCalendar, settings),
        });

        form.reset();

        return;
      }

      const updatedValues = mergeChanges({
        form: {
          defaultValues: formState.values,
          values: formState.values,
          event: formState.event,
        },
        update: {
          event,
          values: parseFormValues(event, defaultCalendar, settings),
        },
      });

      if (updatedValues.values) {
        setFormState({
          event,
          values: updatedValues.values,
        });

        form.reset();

        return;
      }

      setFormState({
        event,
        values: parseFormValues(event, defaultCalendar, settings),
      });

      await form.handleSubmit();
      form.reset();
    },
    [
      defaultCalendar,
      formState.event,
      formState.values,
      setFormState,
      settings,
    ],
  );
}
