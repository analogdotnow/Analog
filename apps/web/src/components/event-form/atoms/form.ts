import { atom } from "jotai";

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
