import { useEffect } from "react";
import {
  navigateToNext,
  navigateToPrevious,
  shouldIgnoreKeyboardEvent,
} from "../utils";
import { KEYBOARD_SHORTCUTS } from "../calendar-constants";
import { useCalendarContext } from "@/contexts/calendar-context";
import { addDays, addMonths, startOfMonth, subDays, subMonths } from "date-fns";
import { useCalendarNavigation } from "./use-calendar-navigation";

interface UseKeyboardShortcutsProps {
  isEventDialogOpen: boolean;
}

export function useKeyboardShortcuts({
  isEventDialogOpen,
}: UseKeyboardShortcutsProps) {
  const { currentDate, view, setView, setCurrentDate } = useCalendarContext();
  const { handlePrevious, handleNext, handleToday } = useCalendarNavigation({
    currentDate,
    setCurrentDate,
    view,
  });

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
          setCurrentDate((prevDate) => navigateToNext(prevDate, view));
          break;
        case KEYBOARD_SHORTCUTS.PREVIOUS_PERIOD:
          setCurrentDate((prevDate) => navigateToPrevious(prevDate, view));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, isEventDialogOpen]);
}
