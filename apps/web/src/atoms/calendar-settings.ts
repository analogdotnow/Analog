import { getDefaultStore } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface CalendarSettings {
  locale: string;
  defaultTimeZone: string;
  defaultCalendar: {
    calendarId: string;
    accountId: string;
    providerId: "google" | "microsoft";
    timeZone: string;
  };
  defaultEventDuration: number;
}

export const calendarSettingsAtom = atomWithStorage<CalendarSettings>(
  "analog-calendar-settings",
  {
    locale: "en-US",
    defaultTimeZone: "Europe/Amsterdam",
    defaultCalendar: {
      calendarId: "primary",
      accountId: "",
      providerId: "google",
      timeZone: "Europe/Amsterdam",
    },
    defaultEventDuration: 60,
  },
);

export const defaultStore = getDefaultStore();
