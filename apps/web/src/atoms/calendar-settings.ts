import { atomWithStorage } from "jotai/utils";
import { Temporal } from "temporal-polyfill";

export interface CalendarSettings {
  locale: string;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  use12Hour: boolean;
  defaultTimeZone: string;
  defaultEventDuration: number;
  defaultStartTime: string;
  easterEggsEnabled: boolean;
}

export const defaultTimeZone = Temporal.Now.timeZoneId();

export const calendarSettingsAtom = atomWithStorage<CalendarSettings>(
  "analog-calendar-settings",
  {
    locale: "en-US",
    weekStartsOn: 1,
    use12Hour: false,
    defaultTimeZone,
    defaultEventDuration: 60,
    defaultStartTime: "09:00",
    easterEggsEnabled: false,
  },
);
