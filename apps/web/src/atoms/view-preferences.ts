import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Temporal } from "temporal-polyfill";

import type { CalendarView } from "@/components/calendar/interfaces";

export interface ViewPreferences {
  showWeekends: boolean;
  showPastEvents: boolean;
  showDeclinedEvents: boolean;
  showWeekNumbers: boolean;
}

export const viewPreferencesAtom = atomWithStorage<ViewPreferences>(
  "analog-view-preferences",
  {
    showWeekends: true,
    showPastEvents: true,
    showDeclinedEvents: false,
    showWeekNumbers: false,
  },
);

export const calendarViewAtom = atomWithStorage<CalendarView>(
  "analog-calendar-view",
  "week",
);

export const currentDateAtom = atom<Temporal.PlainDate>(
  Temporal.Now.plainDateISO(),
);
