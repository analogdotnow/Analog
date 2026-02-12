import type { StateCreator } from "zustand";

import type { Calendar } from "@/lib/interfaces";
import type { CalendarStore } from "../calendar-store";

export interface CalendarSettings {
  locale: string;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  use12Hour: boolean;
  defaultEventDuration: number;
  defaultStartTime: string;
  easterEggsEnabled: boolean;
}

export interface CalendarPreference {
  accountId: string;
  color: string | null;
  hidden: boolean;
}

export type CalendarPreferences = Record<string, CalendarPreference>;

export interface ViewPreferences {
  showWeekends: boolean;
  showPastEvents: boolean;
  showDeclinedEvents: boolean;
  showWeekNumbers: boolean;
  weekViewNumberOfDays: number;
}

export interface TimeZone {
  id: string;
  label?: string;
}

export interface SettingsSlice {
  // State
  calendarSettings: CalendarSettings;
  calendarPreferences: CalendarPreferences;
  viewPreferences: ViewPreferences;
  temperatureUnit: "C" | "F";
  timeZones: TimeZone[];
  defaultCalendar: Calendar | null;

  // Actions
  setCalendarSettings: (settings: Partial<CalendarSettings>) => void;
  setCalendarPreferences: (preferences: CalendarPreferences) => void;
  setCalendarPreference: (
    accountId: string,
    calendarId: string,
    updates: Partial<Omit<CalendarPreference, "accountId">>,
  ) => void;
  setViewPreferences: (prefs: Partial<ViewPreferences>) => void;
  setTemperatureUnit: (unit: "C" | "F") => void;
  setDefaultCalendar: (calendar: Calendar | null) => void;
  addTimeZone: (tz: TimeZone) => void;
  removeTimeZone: (id: string) => void;
  reorderTimeZones: (ids: string[]) => void;
  updateTimeZoneLabel: (id: string, label?: string) => void;
  setTimeZones: (tzs: TimeZone[]) => void;
}

export function getCalendarPreference(
  preferences: CalendarPreferences,
  accountId: string,
  calendarId: string,
): CalendarPreference | undefined {
  return preferences[`${accountId}.${calendarId}`];
}

export function preferredTempUnitFromLocale(): "C" | "F" {
  if (typeof navigator === "undefined") {
    return "C";
  }

  const region = new Intl.Locale(navigator.language).region;

  const F_REGIONS = new Set([
    "US",
    "BS",
    "BZ",
    "KY",
    "PW",
    "LR",
    "FM",
    "MH",
    "GU",
    "PR",
    "VI",
    "AS",
    "MP",
    "TC",
  ]);

  return F_REGIONS.has(region?.toUpperCase() ?? "") ? "F" : "C";
}

export const createSettingsSlice: StateCreator<
  CalendarStore,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  SettingsSlice
> = (set) => ({
  // Initial state
  calendarSettings: {
    locale: "en-US",
    weekStartsOn: 1,
    use12Hour: false,
    defaultEventDuration: 60,
    defaultStartTime: "09:00",
    easterEggsEnabled: false,
  },
  calendarPreferences: {},
  viewPreferences: {
    showWeekends: true,
    showPastEvents: true,
    showDeclinedEvents: false,
    showWeekNumbers: false,
    weekViewNumberOfDays: 7,
  },
  temperatureUnit: preferredTempUnitFromLocale(),
  timeZones: [],
  defaultCalendar: null,

  // Actions
  setDefaultCalendar: (calendar) =>
    set({ defaultCalendar: calendar }, undefined, "calendar/setDefault"),

  setCalendarSettings: (settings) =>
    set(
      (state) => ({
        calendarSettings: { ...state.calendarSettings, ...settings },
      }),
      undefined,
      "settings/update",
    ),

  setCalendarPreferences: (preferences) =>
    set({ calendarPreferences: preferences }, undefined, "preferences/setAll"),

  setCalendarPreference: (accountId, calendarId, updates) =>
    set(
      (state) => {
        const key = `${accountId}.${calendarId}`;

        return {
          calendarPreferences: {
            ...state.calendarPreferences,
            [key]: {
              accountId,
              color: null,
              hidden: false,
              ...state.calendarPreferences[key],
              ...updates,
            },
          },
        };
      },
      undefined,
      "preferences/update",
    ),

  setViewPreferences: (prefs) =>
    set(
      (state) => ({
        viewPreferences: { ...state.viewPreferences, ...prefs },
      }),
      undefined,
      "view/updatePreferences",
    ),

  setTemperatureUnit: (unit) =>
    set({ temperatureUnit: unit }, undefined, "settings/setTempUnit"),

  addTimeZone: (tz) =>
    set(
      (state) => {
        if (state.timeZones.some((t) => t.id === tz.id)) {
          return state;
        }
        return { timeZones: [...state.timeZones, tz] };
      },
      undefined,
      "timezone/add",
    ),

  removeTimeZone: (id) =>
    set(
      (state) => {
        if (state.timeZones.length <= 1) {
          return state;
        }

        return {
          timeZones: state.timeZones.filter((t) => t.id !== id),
        };
      },
      undefined,
      "timezone/remove",
    ),

  reorderTimeZones: (ids) =>
    set(
      (state) => {
        const reordered = ids
          .map((id) => state.timeZones.find((t) => t.id === id))
          .filter((t): t is TimeZone => t !== undefined);

        if (reordered.length !== state.timeZones.length) {
          return state;
        }

        return { timeZones: reordered };
      },
      undefined,
      "timezone/reorder",
    ),

  updateTimeZoneLabel: (id, label) =>
    set(
      (state) => ({
        timeZones: state.timeZones.map((t) =>
          t.id === id ? { ...t, label } : t,
        ),
      }),
      undefined,
      "timezone/updateLabel",
    ),

  setTimeZones: (tzs) => set({ timeZones: tzs }, undefined, "timezone/setAll"),
});
