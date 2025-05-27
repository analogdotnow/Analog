import { useEffect } from "react";
import { addDays, addMonths, startOfMonth, subDays, subMonths } from "date-fns";

import { useCalendarContext } from "@/contexts/calendar-context";
import { KEYBOARD_SHORTCUTS } from "../calendar-constants";
import { shouldIgnoreKeyboardEvent } from "../utils";

interface UseKeyboardShortcutsProps {
  isEventDialogOpen: boolean;
}

export function useKeyboardShortcuts({
  isEventDialogOpen,
}: UseKeyboardShortcutsProps) {
  const { view, setView, setCurrentDate } = useCalendarContext();

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
        case KEYBOARD_SHORTCUTS.TODAY:
          setCurrentDate(new Date());
          break;
        case KEYBOARD_SHORTCUTS.NEXT_PERIOD:
          switch (view) {
            case "month":
              setCurrentDate((prevDate) => {
                return startOfMonth(addMonths(prevDate, 1));
              });
              break;
            case "week":
              setCurrentDate((prevDate) => addDays(prevDate, 7));
              break;
            case "day":
            case "agenda":
              setCurrentDate((prevDate) => {
                return addDays(prevDate, 1);
              });
              break;
          }

          break;
        case KEYBOARD_SHORTCUTS.PREVIOUS_PERIOD:
          switch (view) {
            case "month":
              setCurrentDate((prevDate) => {
                return startOfMonth(subMonths(prevDate, 1));
              });
              break;
            case "week":
              setCurrentDate((prevDate) => subDays(prevDate, 7));
              break;
            case "day":
            case "agenda":
              setCurrentDate((prevDate) => {
                return subDays(prevDate, 1);
              });
              break;
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, isEventDialogOpen]);
}
