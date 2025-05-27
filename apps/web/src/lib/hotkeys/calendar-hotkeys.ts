"use client";

import { addDays, addMonths, startOfMonth, subDays, subMonths } from "date-fns";
import { useHotkeys } from "react-hotkeys-hook";

import { useCalendarContext } from "@/contexts/calendar-context";

export const KEYBOARD_SHORTCUTS = {
  MONTH: "m",
  WEEK: "w",
  DAY: "d",
  AGENDA: "a",
  NEXT_PERIOD: "n",
  PREVIOUS_PERIOD: "p",
  TODAY: "t",
} as const;

export function CalendarHotkeys() {
  const { view, setView, setCurrentDate } = useCalendarContext();

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
  useHotkeys(KEYBOARD_SHORTCUTS.TODAY, () => setCurrentDate(new Date()), {
    scopes: ["calendar"],
  });

  useHotkeys(
    KEYBOARD_SHORTCUTS.NEXT_PERIOD,
    () => {
      switch (view) {
        case "month":
          setCurrentDate((prevDate) => startOfMonth(addMonths(prevDate, 1)));
          break;
        case "week":
          setCurrentDate((prevDate) => addDays(prevDate, 7));
          break;
        case "day":
        case "agenda":
          setCurrentDate((prevDate) => addDays(prevDate, 1));
          break;
      }
    },
    { scopes: ["calendar"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.PREVIOUS_PERIOD,
    () => {
      switch (view) {
        case "month":
          setCurrentDate((prevDate) => startOfMonth(subMonths(prevDate, 1)));
          break;
        case "week":
          setCurrentDate((prevDate) => subDays(prevDate, 7));
          break;
        case "day":
        case "agenda":
          setCurrentDate((prevDate) => subDays(prevDate, 1));
          break;
      }
    },
    { scopes: ["calendar"] },
  );

  return null;
}
