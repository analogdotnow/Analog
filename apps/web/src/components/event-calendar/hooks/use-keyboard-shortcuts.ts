import { useEffect } from "react";
import { shouldIgnoreKeyboardEvent } from "../utils";
import { KEYBOARD_SHORTCUTS } from "../calendar-constants";
import { useCalendarContext } from "@/contexts/calendar-context";

interface UseKeyboardShortcutsProps {
  isEventDialogOpen: boolean;
}

export function useKeyboardShortcuts({
  isEventDialogOpen,
}: UseKeyboardShortcutsProps) {
  const { setView } = useCalendarContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(e) || isEventDialogOpen) {
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
