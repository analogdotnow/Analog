import { useEffect } from "react";
import { CalendarView } from "../types";
import { shouldIgnoreKeyboardEvent } from "../utils";
import { KEYBOARD_SHORTCUTS } from "../calendar-constants";

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
