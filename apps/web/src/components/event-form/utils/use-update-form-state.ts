import * as React from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useDefaultCalendar } from "@/components/calendar/hooks/use-default-calendar";
import type { CalendarEvent } from "@/lib/interfaces";
import { formAtom } from "../atoms/form";
import { parseFormValues } from "./transform/input";

export function useUpdateFormState() {
  const defaultCalendar = useDefaultCalendar();
  const settings = useAtomValue(calendarSettingsAtom);

  const setFormState = useSetAtom(formAtom);

  return React.useCallback(
    async (event: CalendarEvent) => {
      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      const values = parseFormValues(event, defaultCalendar, settings);

      setFormState({
        event,
        values,
      });

      return;
    },
    [defaultCalendar, setFormState, settings],
  );
}
