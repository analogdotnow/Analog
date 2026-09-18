import * as React from "react";
import { useSetAtom } from "jotai";

import {
  formAtom,
  pendingFieldPatchAtom,
  type FormPatchKey,
} from "@/components/event-form/atoms/form";
import { useDefaultCalendar } from "@/hooks/calendar/use-default-calendar";
import type { CalendarEvent, EventChanges } from "@/lib/interfaces";
import { useDefaultTimeZone } from "@/store/hooks";
import { parseFormValues } from "./transform/input";

export function useParseFormValues() {
  const defaultCalendar = useDefaultCalendar();
  const defaultTimeZone = useDefaultTimeZone();

  return React.useCallback(
    (event: CalendarEvent) => {
      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      return parseFormValues(event, defaultCalendar, defaultTimeZone);
    },
    [defaultCalendar, defaultTimeZone],
  );
}

// Full hydration: the event becomes both the diff baseline and the reset
// baseline; any deferred patch belonged to the previous state.
export function useUpdateFormState() {
  const parseValues = useParseFormValues();

  const setFormState = useSetAtom(formAtom);
  const setPendingFieldPatch = useSetAtom(pendingFieldPatchAtom);

  return React.useCallback(
    (event: CalendarEvent) => {
      const values = parseValues(event);

      setFormState({
        event,
        values,
      });
      setPendingFieldPatch(null);

      return values;
    },
    [parseValues, setFormState, setPendingFieldPatch],
  );
}

export const patchableFields: FormPatchKey[] = [
  "title",
  "description",
  "location",
  "start",
  "end",
  "allDay",
  "availability",
  "visibility",
  "attendees",
  "response",
  "recurrence",
  "recurringEventId",
  "conference",
  "calendar",
];

// Defers an edit into a dirty form: only the fields present in `changes` are
// queued for the live form to apply, so in-progress edits to other fields
// survive, while the baselines stay untouched and the deferred change still
// diffs against the snapshot and is emitted on save.
export function useUpdateFormValues() {
  const parseValues = useParseFormValues();

  const setPendingFieldPatch = useSetAtom(pendingFieldPatchAtom);

  return React.useCallback(
    (event: CalendarEvent, changes: EventChanges) => {
      const values = parseValues(event);
      const keys = patchableFields.filter((field) => field in changes);

      // `event` already carries every earlier deferred change, so its values
      // are current for the accumulated keys too.
      setPendingFieldPatch((prev) =>
        prev ? { values, keys: [...prev.keys, ...keys] } : { values, keys },
      );
    },
    [parseValues, setPendingFieldPatch],
  );
}
