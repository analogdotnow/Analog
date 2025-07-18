import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface CalendarPreference {
  hidden?: boolean;
  order?: number;
  color?: string;
}

export type CalendarPreferences = Record<string, CalendarPreference>;

export const calendarPreferencesAtom = atomWithStorage<CalendarPreferences>(
  "analog-calendar-preferences",
  {},
);

export function useCalendarPreferences() {
  return useAtom(calendarPreferencesAtom);
}
