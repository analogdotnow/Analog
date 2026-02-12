import { Temporal } from "temporal-polyfill";
import { devtools, persist } from "zustand/middleware";
import { createWithEqualityFn as createStore } from "zustand/traditional";
import { shallow } from "zustand/vanilla/shallow";

import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@repo/temporal";

import {
  createSettingsSlice,
  preferredTempUnitFromLocale,
  type SettingsSlice,
} from "./slices/settings-slice";
import { createUISlice, type UISlice } from "./slices/ui-slice";
import { createViewSlice, type ViewSlice } from "./slices/view-slice";

// Re-export types from slices for backwards compatibility
export type { SettingsSlice } from "./slices/settings-slice";
export type { ViewSlice } from "./slices/view-slice";
export type { UISlice } from "./slices/ui-slice";
export type {
  CalendarSettings,
  CalendarPreference,
  CalendarPreferences,
  ViewPreferences,
  TimeZone,
} from "./slices/settings-slice";

// Re-export utility functions
export {
  getCalendarPreference,
  preferredTempUnitFromLocale,
} from "./slices/settings-slice";

// Combined store type
export type CalendarStore = SettingsSlice & ViewSlice & UISlice;

// Legacy type aliases for backwards compatibility
export type CalendarState = CalendarStore;
export type CalendarActions = Pick<
  CalendarStore,
  | "setDefaultCalendar"
  | "setCalendarSettings"
  | "setCalendarPreferences"
  | "setCalendarPreference"
  | "setViewPreferences"
  | "setCalendarView"
  | "setTemperatureUnit"
  | "addTimeZone"
  | "removeTimeZone"
  | "reorderTimeZones"
  | "updateTimeZoneLabel"
  | "setTimeZones"
  | "setActiveLayout"
  | "setCellHeight"
  | "setCommandMenuOpen"
  | "pushCommandMenuPage"
  | "popCommandMenuPage"
  | "resetCommandMenuPages"
  | "setDragging"
  | "setResizing"
  | "setDraggingEventId"
  | "setAnchor"
  | "setVisibleRange"
  | "setSelectedDisplayItemIds"
  | "setSelectedEventIds"
  | "setCurrentDate"
  | "navigateTo"
  | "addWindow"
  | "removeWindow"
  | "setWindowsExpanded"
  | "toggleWindowsExpanded"
>;

const defaultTimeZone = Temporal.Now.timeZoneId();
const now = Temporal.Now.plainDateISO();

export const defaultInitState: Omit<CalendarStore, keyof CalendarActions> = {
  // Settings slice
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
  timeZones: [{ id: defaultTimeZone }],
  defaultCalendar: null,

  // View slice
  calendarView: "week",
  currentDate: now,
  anchor: now,
  visibleRange: null,
  selectedDisplayItemIds: [],
  isDragging: false,
  isResizing: false,
  draggingEventId: null,
  cellHeight: 64,
  timeMin: startOfWeek(startOfMonth(now.subtract({ days: 120 })), {
    weekStartsOn: 1,
  }),
  timeMax: endOfWeek(endOfMonth(now.add({ days: 120 })), { weekStartsOn: 1 }),

  // UI slice
  activeLayout: undefined,
  commandMenuOpen: false,
  commandMenuPages: [],
  windowStack: [],
  windowsExpanded: false,
};

export type PersistedState = Pick<
  CalendarStore,
  | "calendarSettings"
  | "calendarPreferences"
  | "viewPreferences"
  | "calendarView"
  | "temperatureUnit"
  | "timeZones"
>;

export const createCalendarStore = (
  initState: Omit<CalendarStore, keyof CalendarActions> = defaultInitState,
) => {
  return createStore<CalendarStore>()(
    devtools(
      persist(
        (...a) => ({
          ...createSettingsSlice(...a),
          ...createViewSlice(...a),
          ...createUISlice(...a),
          // Override initial state from slices with provided initState
          ...initState,
        }),
        {
          name: "analog-calendar-store",
          partialize: (state): PersistedState => ({
            // Settings slice (persisted)
            calendarSettings: state.calendarSettings,
            calendarPreferences: state.calendarPreferences,
            viewPreferences: state.viewPreferences,
            temperatureUnit: state.temperatureUnit,
            timeZones: state.timeZones,
            // View slice (only calendarView persisted)
            calendarView: state.calendarView,
          }),
        },
      ),
      {
        name: "CalendarStore",
        enabled: process.env.NODE_ENV === "development",
      },
    ),
    shallow,
  );
};
