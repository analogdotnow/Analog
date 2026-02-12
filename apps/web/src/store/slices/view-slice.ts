import { Temporal } from "temporal-polyfill";
import type { StateCreator } from "zustand";

import {
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "@repo/temporal";

import type { CalendarView } from "@/components/calendar/interfaces";
import type { CalendarStore } from "../calendar-store";

const TIME_RANGE_DAYS_PAST = 120;
const TIME_RANGE_DAYS_FUTURE = 120;

function calculateStart(currentDate: Temporal.PlainDate) {
  const start = currentDate.subtract({
    days: TIME_RANGE_DAYS_PAST,
  });
  return startOfWeek(startOfMonth(start), { weekStartsOn: 1 });
}

function calculateEnd(currentDate: Temporal.PlainDate) {
  const end = currentDate.add({
    days: TIME_RANGE_DAYS_FUTURE,
  });
  return endOfWeek(endOfMonth(end), { weekStartsOn: 1 });
}

export interface ViewSlice {
  // State
  calendarView: CalendarView;
  currentDate: Temporal.PlainDate;
  anchor: Temporal.PlainDate;
  visibleRange: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  } | null;
  selectedDisplayItemIds: string[];
  isDragging: boolean;
  isResizing: boolean;
  draggingEventId: string | null;
  cellHeight: number;

  timeMin: Temporal.PlainDate;
  timeMax: Temporal.PlainDate;

  // Actions
  setCalendarView: (view: CalendarView) => void;
  setCurrentDate: (date: Temporal.PlainDate) => void;
  navigateTo: (date: Temporal.PlainDate) => void;
  setAnchor: (date: Temporal.PlainDate) => void;
  setVisibleRange: (
    range: { start: Temporal.PlainDate; end: Temporal.PlainDate } | null,
  ) => void;
  setSelectedDisplayItemIds: (
    ids: string[] | ((prev: string[]) => string[]),
  ) => void;
  setSelectedEventIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  setDragging: (isDragging: boolean) => void;
  setResizing: (isResizing: boolean) => void;
  setDraggingEventId: (eventId: string | null) => void;
  setCellHeight: (height: number) => void;
}

const now = Temporal.Now.plainDateISO();

export const createViewSlice: StateCreator<
  CalendarStore,
  [["zustand/devtools", never], ["zustand/persist", unknown]],
  [],
  ViewSlice
> = (set) => ({
  // Initial state
  calendarView: "week",
  currentDate: now,
  anchor: now,
  visibleRange: null,
  selectedDisplayItemIds: [],
  isDragging: false,
  isResizing: false,
  draggingEventId: null,
  cellHeight: 64,
  timeMin: calculateStart(now),
  timeMax: calculateEnd(now),

  // Actions
  setCalendarView: (view) =>
    set({ calendarView: view }, undefined, "view/setCalendarView"),

  setCurrentDate: (date) =>
    set(
      (state) => {
        if (Temporal.PlainDate.compare(state.currentDate, date) === 0) {
          return state;
        }

        const timeMin = calculateStart(date);
        const timeMax = calculateEnd(date);

        if (
          Temporal.PlainDate.compare(state.timeMin, timeMin) === 0 &&
          Temporal.PlainDate.compare(state.timeMax, timeMax) === 0
        ) {
          return { currentDate: date };
        }

        return { currentDate: date, timeMin, timeMax };
      },
      undefined,
      "navigation/setCurrentDate",
    ),

  navigateTo: (date) =>
    set(
      (state) => {
        if (Temporal.PlainDate.compare(state.currentDate, date) === 0) {
          return state;
        }

        const timeMin = calculateStart(date);
        const timeMax = calculateEnd(date);
        if (
          Temporal.PlainDate.compare(state.timeMin, timeMin) === 0 &&
          Temporal.PlainDate.compare(state.timeMax, timeMax) === 0
        ) {
          return { currentDate: date, anchor: date };
        }

        return { currentDate: date, anchor: date, timeMin, timeMax };
      },
      undefined,
      "navigation/navigateTo",
    ),

  setAnchor: (date) =>
    set(
      (state) =>
        Temporal.PlainDate.compare(state.anchor, date) === 0
          ? state
          : { anchor: date },
      undefined,
      "scroll/setAnchor",
    ),

  setVisibleRange: (range) =>
    set(
      (state) => {
        if (range === null) {
          return { visibleRange: null };
        }

        if (state.visibleRange === null) {
          return { visibleRange: range };
        }

        if (
          isSameDay(state.visibleRange.start, range.start) &&
          isSameDay(state.visibleRange.end, range.end)
        ) {
          return state;
        }

        return { visibleRange: range };
      },
      undefined,
      "scroll/setVisibleRange",
    ),

  setSelectedDisplayItemIds: (ids) =>
    set(
      (state) => ({
        selectedDisplayItemIds:
          typeof ids === "function" ? ids(state.selectedDisplayItemIds) : ids,
      }),
      undefined,
      "selection/setDisplayItems",
    ),

  setSelectedEventIds: (ids) =>
    set(
      (state) => {
        const prev = state.selectedDisplayItemIds
          .filter((id) => id.startsWith("event_"))
          .map((id) => id.slice(6));

        const eventIds = typeof ids === "function" ? ids(prev) : ids;

        const otherItems = state.selectedDisplayItemIds.filter(
          (id) => !id.startsWith("event_"),
        );

        return {
          selectedDisplayItemIds: [
            ...otherItems,
            ...eventIds.map((id) => `event_${id}`),
          ],
        };
      },
      undefined,
      "selection/setEventIds",
    ),

  setDragging: (isDragging) =>
    set({ isDragging }, undefined, "drag/setDragging"),

  setResizing: (isResizing) =>
    set({ isResizing }, undefined, "drag/setResizing"),

  setDraggingEventId: (eventId) =>
    set({ draggingEventId: eventId }, undefined, "drag/setEventId"),

  setCellHeight: (height) =>
    set({ cellHeight: height }, undefined, "layout/setCellHeight"),
});
