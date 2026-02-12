import * as React from "react";
import { useSetAtom } from "jotai";

import { formAtom } from "@/components/event-form/atoms/form";
import { useDefaultCalendar } from "@/hooks/calendar/use-default-calendar";
import type { CalendarEvent } from "@/lib/interfaces";
import { useDefaultTimeZone } from "@/store/hooks";
import { parseFormValues } from "./transform/input";

export function useUpdateFormState() {
  const defaultCalendar = useDefaultCalendar();
  const defaultTimeZone = useDefaultTimeZone();

  const setFormState = useSetAtom(formAtom);

  return React.useCallback(
    async (event: CalendarEvent) => {
      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      const values = parseFormValues(event, defaultCalendar, defaultTimeZone);

      setFormState({
        event,
        values,
      });

      return;
    },
    [defaultCalendar, setFormState, defaultTimeZone],
  );
}
