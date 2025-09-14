import { atom } from "jotai";

import type { CalendarEvent } from "@/lib/interfaces";
import { initialValues } from "../utils/defaults";
import type { FormValues } from "../utils/schema";

interface Form {
  event: CalendarEvent | undefined;
  values: FormValues;
}

export const formAtom = atom<Form>({
  event: undefined,
  values: initialValues,
});

export const isPristineAtom = atom(true);

export const formDisabledAtom = atom((get) => {
  const form = get(formAtom);

  return form.event?.readOnly ?? false;
});

export const defaultValuesAtom = atom((get) => {
  const form = get(formAtom);

  return form.values;
});

export const getEventInForm = (eventId: string) =>
  atom((get) => {
    const form = get(formAtom);

    if (form.event?.id !== eventId) {
      return undefined;
    }

    return form.event;
  });
