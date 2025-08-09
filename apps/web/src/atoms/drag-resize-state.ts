import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * Tracks whether an event is currently being dragged.
 * Set to true on drag start, false on drag end.
 */
export const isDraggingAtom = atom<boolean>(false);

/**
 * Tracks whether an event is currently being resized.
 * Set to true on resize start (top or bottom), false on resize end.
 */
export const isResizingAtom = atom<boolean>(false);

// Convenient hooks ----------------------------------------------------------------------------------------------------------------

export function useIsDragging(): boolean {
  return useAtomValue(isDraggingAtom);
}

export function useSetIsDragging(): (
  value: boolean | ((prev: boolean) => boolean),
) => void {
  return useSetAtom(isDraggingAtom);
}

export function useSetIsResizing(): (
  value: boolean | ((prev: boolean) => boolean),
) => void {
  return useSetAtom(isResizingAtom);
}
