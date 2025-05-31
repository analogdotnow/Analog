"use client";

import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import {
  navigateToNext,
  navigateToPrevious,
} from "@/components/event-calendar/utils/date-time";
import { useCalendarContext } from "@/contexts/calendar-context";
import { useTauri } from "@/providers/tauri-provider";

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
  const { isDesktop } = useTauri();

  // Web hotkeys (still needed for when app is focused)
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
    () => setCurrentDate((prevDate) => navigateToNext(prevDate, view)),
    { scopes: ["calendar"] },
  );

  useHotkeys(
    KEYBOARD_SHORTCUTS.PREVIOUS_PERIOD,
    () => setCurrentDate((prevDate) => navigateToPrevious(prevDate, view)),
    { scopes: ["calendar"] },
  );

  // Desktop global shortcut handlers
  useEffect(() => {
    if (!isDesktop) return;

    const handleTauriShortcuts = (event: CustomEvent) => {
      const action = event.type.replace("tauri:", "");
      
      switch (action) {
        case "week-view":
          setView("week");
          break;
        case "month-view":
          setView("month");
          break;
        case "day-view":
          setView("day");
          break;
        case "show-today":
          setCurrentDate(new Date());
          break;
        case "new-event":
          // Trigger new event dialog
          window.dispatchEvent(new CustomEvent("calendar:new-event"));
          break;
        default:
          console.log("Unknown Tauri shortcut:", action);
      }
    };

    // Listen for Tauri global shortcuts
    window.addEventListener("tauri:week-view", handleTauriShortcuts as EventListener);
    window.addEventListener("tauri:month-view", handleTauriShortcuts as EventListener);
    window.addEventListener("tauri:day-view", handleTauriShortcuts as EventListener);
    window.addEventListener("tauri:show-today", handleTauriShortcuts as EventListener);
    window.addEventListener("tauri:new-event", handleTauriShortcuts as EventListener);

    return () => {
      window.removeEventListener("tauri:week-view", handleTauriShortcuts as EventListener);
      window.removeEventListener("tauri:month-view", handleTauriShortcuts as EventListener);
      window.removeEventListener("tauri:day-view", handleTauriShortcuts as EventListener);
      window.removeEventListener("tauri:show-today", handleTauriShortcuts as EventListener);
      window.removeEventListener("tauri:new-event", handleTauriShortcuts as EventListener);
    };
  }, [isDesktop, setView, setCurrentDate]);

  return null;
}
