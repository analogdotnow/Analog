/**
 * Keyboard Shortcuts Hook
 *
 * Handles keyboard shortcuts for calendar navigation including:
 * - View switching shortcuts (M, W, D, A)
 * - Keyboard event filtering (ignore when dialog open or typing)
 * - Event listener management
 *
 * This hook encapsulates all keyboard shortcut logic that was previously
 * mixed with other component logic in EventCalendar.
 */

import { useEffect } from "react";
import { CalendarView } from "../types";
import { KEYBOARD_SHORTCUTS, shouldIgnoreKeyboardEvent } from "../utils";

interface UseKeyboardShortcutsProps {
  setView: (view: CalendarView) => void;
  isEventDialogOpen: boolean;
}

export function useKeyboardShortcuts({
  setView,
  isEventDialogOpen,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(e, isEventDialogOpen)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case KEYBOARD_SHORTCUTS.MONTH:
          setView("month");
          break;
        case KEYBOARD_SHORTCUTS.WEEK:
          setView("week");
          break;
        case KEYBOARD_SHORTCUTS.DAY:
          setView("day");
          break;
        case KEYBOARD_SHORTCUTS.AGENDA:
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEventDialogOpen, setView]);
}
