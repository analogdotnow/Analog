"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import {
  navigateToNext,
  navigateToPrevious,
} from "@/components/calendar/utils/date-time";
import {
  getCalendarStore,
  useCalendarStore,
} from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

const KEYBOARD_SHORTCUTS = {
  MONTH: "m",
  WEEK: "w",
  DAY: "d",
  AGENDA: "a",
  NEXT_PERIOD: "n",
  PREVIOUS_PERIOD: "p",
  TODAY: "t",
  CREATE_EVENT: "c",
} as const;

export function CalendarHotkeys() {
  const defaultTimeZone = useDefaultTimeZone();
  const view = useCalendarStore((s) => s.calendarView);
  const setView = useCalendarStore((s) => s.setCalendarView);
  const navigateTo = useCalendarStore((s) => s.navigateTo);

  useHotkeys(KEYBOARD_SHORTCUTS.MONTH, () => setView("month"), {
    scopes: ["calendar"],
  });

  useHotkeys(KEYBOARD_SHORTCUTS.WEEK, () => setView("week"), {
    scopes: ["calendar"],
  });

  useHotkeys(KEYBOARD_SHORTCUTS.DAY, () => setView("day"), {
    scopes: ["calendar"],
  });

  useHotkeys(KEYBOARD_SHORTCUTS.AGENDA, () => setView("agenda"), {
    scopes: ["calendar"],
  });

  useHotkeys(
    KEYBOARD_SHORTCUTS.TODAY,
    () => navigateTo(Temporal.Now.plainDateISO(defaultTimeZone)),
    {
      scopes: ["calendar"],
    },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.NEXT_PERIOD,
    () => {
      const prevDate = getCalendarStore().getState().currentDate;

      navigateTo(navigateToNext(prevDate, view));
    },
    { scopes: ["calendar"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.PREVIOUS_PERIOD,
    () => {
      const prevDate = getCalendarStore().getState().currentDate;

      navigateTo(navigateToPrevious(prevDate, view));
    },
    { scopes: ["calendar"] },
  );

  return null;
}
