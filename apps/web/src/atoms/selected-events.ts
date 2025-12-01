import { atom } from "jotai";

export const selectedEventIdsAtom = atom<string[]>([]);

export const isEventSelected = (eventId: string) =>
  atom((get) => {
    const events = get(selectedEventIdsAtom);

    return events.some((selectedEventId) => {
      return selectedEventId === eventId;
    });
  });
