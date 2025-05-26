import { atomWithStorage } from "jotai/utils";

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
  }
);
