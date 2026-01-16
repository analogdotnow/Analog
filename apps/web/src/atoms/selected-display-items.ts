import { atom } from "jotai";

export const selectedDisplayItemIdsAtom = atom<string[]>([]);

export const isDisplayItemSelected = (displayItemId: string) =>
  atom((get) => {
    const items = get(selectedDisplayItemIdsAtom);

    return items.includes(displayItemId);
  });

export const isEventSelected = (eventId: string) =>
  atom((get) => {
    const items = get(selectedDisplayItemIdsAtom);

    return items.includes(`event_${eventId}`);
  });

export const selectedEventIdsAtom = atom(
  (get) => {
    return get(selectedDisplayItemIdsAtom)
      .filter((id) => id.startsWith("event_"))
      .map((id) => id.slice(6));
  },
  (get, set, update: string[] | ((prev: string[]) => string[])) => {
    const prev = get(selectedDisplayItemIdsAtom)
      .filter((id) => id.startsWith("event_"))
      .map((id) => id.slice(6));

    const eventIds = typeof update === "function" ? update(prev) : update;

    const otherItems = get(selectedDisplayItemIdsAtom).filter(
      (id) => !id.startsWith("event_"),
    );

    set(selectedDisplayItemIdsAtom, [
      ...otherItems,
      ...eventIds.map((id) => `event_${id}`),
    ]);
  },
);
