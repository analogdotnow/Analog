/**
 * Calendar Navigation Hook
 *
 * Handles all calendar navigation logic including:
 * - Previous/next period navigation based on current view
 * - Today navigation
 * - Navigation state management
 *
 * This hook encapsulates the navigation logic that was previously
 * scattered throughout the EventCalendar component.
 */

import { useCallback } from "react";
import { CalendarView } from "../types";
import { navigateToNext, navigateToPrevious } from "../utils";

interface UseCalendarNavigationProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: CalendarView;
}

export function useCalendarNavigation({
  currentDate,
  setCurrentDate,
  view,
}: UseCalendarNavigationProps) {
  const handlePrevious = useCallback(() => {
    setCurrentDate(navigateToPrevious(currentDate, view));
  }, [currentDate, view, setCurrentDate]);

  const handleNext = useCallback(() => {
    setCurrentDate(navigateToNext(currentDate, view));
  }, [currentDate, view, setCurrentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  return {
    handlePrevious,
    handleNext,
    handleToday,
  };
}
