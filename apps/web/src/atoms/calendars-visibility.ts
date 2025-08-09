import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

interface CalendarsVisibility {
  hiddenCalendars: string[];
}

export const calendarsVisibilityAtom = atomWithStorage<CalendarsVisibility>(
  "analog-calendars-visibility",
  { hiddenCalendars: [] },
);

export function useCalendarsVisibility() {
  return useAtom(calendarsVisibilityAtom);
}
