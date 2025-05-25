import { atom } from "jotai";

export interface ViewPreferences {
  showWeekends: boolean;
  showPastEvents: boolean;
  showDeclinedEvents: boolean;
  showWeekNumbers: boolean;
}

export const viewPreferencesAtom = atom<ViewPreferences>({
  showWeekends: true,
  showPastEvents: true,
  showDeclinedEvents: false,
  showWeekNumbers: false,
});
