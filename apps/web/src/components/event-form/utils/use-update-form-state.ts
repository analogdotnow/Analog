import * as React from "react";
import { useSetAtom } from "jotai";

import {
  formAtom,
  pendingFieldPatchAtom,
  type FormPatchKey,
} from "@/components/event-form/atoms/form";
import { useDefaultCalendar } from "@/hooks/calendar/use-default-calendar";
import type { CalendarEvent } from "@/lib/interfaces";
import { useDefaultTimeZone } from "@/store/hooks";
import type { FormValues } from "./schema";
import { parseFormValues } from "./transform/input";

export function useUpdateFormState() {
  const defaultCalendar = useDefaultCalendar();
  const defaultTimeZone = useDefaultTimeZone();

  const setFormState = useSetAtom(formAtom);
  const setPendingFieldPatch = useSetAtom(pendingFieldPatchAtom);

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
      setPendingFieldPatch(null);

      return;
    },
    [defaultCalendar, setFormState, defaultTimeZone, setPendingFieldPatch],
  );
}

const patchableFields: FormPatchKey[] = [
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

function assignFormValue<K extends FormPatchKey>(
  target: FormValues,
  source: FormValues,
  key: K,
) {
  target[key] = source[key];
}

// Patches the form for an edit deferred into a dirty form: only the fields
// present in `changes` are merged into formAtom.values and queued for the
// live form to apply, so in-progress edits to other fields survive, while
// formAtom.event — the frozen diff baseline — stays untouched and the
// deferred change still diffs against the snapshot and is emitted on save.
export function useUpdateFormValues() {
  const defaultCalendar = useDefaultCalendar();
  const defaultTimeZone = useDefaultTimeZone();

  const setFormState = useSetAtom(formAtom);
  const setPendingFieldPatch = useSetAtom(pendingFieldPatchAtom);

  return React.useCallback(
    async (event: CalendarEvent, changes: Partial<CalendarEvent>) => {
      if (!defaultCalendar) {
        throw new Error("Default calendar not found");
      }

      const values = parseFormValues(event, defaultCalendar, defaultTimeZone);
      const keys: FormPatchKey[] = [];

      for (const field of patchableFields) {
        if (field in changes) {
          keys.push(field);
        }
      }

      setFormState((prev) => {
        const merged = { ...prev.values };

        for (const key of keys) {
          assignFormValue(merged, values, key);
        }

        return { event: prev.event, values: merged };
      });

      setPendingFieldPatch((prev) => {
        if (!prev) {
          return keys;
        }

        return [...prev, ...keys];
      });

      return;
    },
    [defaultCalendar, setFormState, defaultTimeZone, setPendingFieldPatch],
  );
}
