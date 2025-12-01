"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { calendarViewAtom, currentDateAtom } from "@/atoms/view-preferences";
import {
  navigateToNext,
  navigateToPrevious,
} from "@/components/calendar/utils/date-time";

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
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);
  const [view, setView] = useAtom(calendarViewAtom);
  const setCurrentDate = useSetAtom(currentDateAtom);

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
    () => setCurrentDate(Temporal.Now.plainDateISO(defaultTimeZone)),
    {
      scopes: ["calendar"],
    },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.NEXT_PERIOD,
    () => setCurrentDate((prevDate) => navigateToNext(prevDate, view)),
    { scopes: ["calendar"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.PREVIOUS_PERIOD,
    () => setCurrentDate((prevDate) => navigateToPrevious(prevDate, view)),
    { scopes: ["calendar"] },
  );

  return null;
}
