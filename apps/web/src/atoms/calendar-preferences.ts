import { atomWithStorage } from "jotai/utils";

export type CalendarPreference = {
  accountId: string;
  color: string | null;
  hidden: boolean;
};

// Using composite key format: "accountId.calendarId"
export type CalendarPreferences = Record<string, CalendarPreference>;

export const calendarPreferencesAtom = atomWithStorage<CalendarPreferences>(
  "analog-calendar-preferences",
  {},
);

// Utility functions for working with calendar preferences
export function getCalendarKey(accountId: string, calendarId: string): string {
  return `${accountId}.${calendarId}`;
}

export function getCalendarPreference(
  preferences: CalendarPreferences,
  accountId: string,
  calendarId: string,
): CalendarPreference | undefined {
  return preferences[getCalendarKey(accountId, calendarId)];
}

export function setCalendarPreference(
  preferences: CalendarPreferences,
  accountId: string,
  calendarId: string,
  updates: Partial<Omit<CalendarPreference, "accountId">>,
): CalendarPreferences {
  const key = getCalendarKey(accountId, calendarId);
  const existing = preferences[key];

  return {
    ...preferences,
    [key]: {
      accountId,
      color: null,
      hidden: false,
      ...existing,
      ...updates,
    },
  };
}
