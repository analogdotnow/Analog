import { atom } from "jotai";

export const isDraggingAtom = atom<boolean>(false);
export const isResizingAtom = atom<boolean>(false);

export const draggingAtom = atom<string | null>(null);

export const addDraggedEventIdAtom = atom(null, (get, set, eventId: string) => {
  set(draggingAtom, eventId);
});

export const removeDraggedEventIdAtom = atom(
  null,
  (get, set, eventId: string) => {
    set(draggingAtom, null);
  },
);
