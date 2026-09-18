import { atom } from "jotai";

import type { StageToken } from "@/components/calendar/flows/write-lane";
import { initialValues } from "@/components/event-form/utils/defaults";
import type { FormValues } from "@/components/event-form/utils/schema";
import type { CalendarEvent } from "@/lib/interfaces";

interface Form {
  event: CalendarEvent | undefined;
  values: FormValues;
}

export const formAtom = atom<Form>({
  event: undefined,
  values: initialValues,
});

export type FormPatchKey = Exclude<keyof FormValues, "id" | "type">;

export interface FieldPatch {
  values: FormValues;
  keys: FormPatchKey[];
}

// An edit deferred into a dirty form (drag, RSVP, calendar move): the live
// form applies `keys` from `values` via setFieldValue, which marks them dirty
// so they survive merges and are emitted on save. formAtom.values (the reset
// baseline) is left untouched so Discard reverts them.
export const pendingFieldPatchAtom = atom<FieldPatch | null>(null);

// The lane previews of the edits deferred into the form. They stay up until
// a save carries the edits out of the form, or a discard/rehydration drops
// them.
export const deferredStageTokensAtom = atom<StageToken[]>([]);

export const isPristineAtom = atom(true);

export const formDisabledAtom = atom((get) => {
  const form = get(formAtom);

  return form.event?.readOnly ?? false;
});

export const defaultValuesAtom = atom((get) => {
  const form = get(formAtom);

  return form.values;
});
