import { atom, useAtomValue, useSetAtom } from "jotai";

/**
 * Single source of truth for the height (in pixels) of one calendar grid cell.
 *
 * NOTE: All sizing-related calculations in week & day views must rely on the
 * value inside this atom.  Keep it in sync with the CSS custom property
 * `--week-cells-height` which is updated by the CalendarView component.
 */
export const cellHeightAtom = atom<number>(64);

// Convenient hooks ----------------------------------------------------------------------------------------------------------------

export function useCellHeight(): number {
  return useAtomValue(cellHeightAtom);
}

export function useSetCellHeight(): (value: number | ((prev: number) => number)) => void {
  return useSetAtom(cellHeightAtom);
} 