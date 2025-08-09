import { useCallback } from "react";
import { Temporal } from "temporal-polyfill";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { navigateToNext, navigateToPrevious } from "../utils/date-time";

export function useCalendarNavigation() {
  const { currentDate, view, setCurrentDate } = useCalendarState();
  const settings = useCalendarSettings();

  const handlePrevious = useCallback(() => {
    setCurrentDate(navigateToPrevious(currentDate, view));
  }, [currentDate, view, setCurrentDate]);

  const handleNext = useCallback(() => {
    setCurrentDate(navigateToNext(currentDate, view));
  }, [currentDate, view, setCurrentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(Temporal.Now.plainDateISO(settings.defaultTimeZone));
  }, [setCurrentDate, settings.defaultTimeZone]);

  return {
    handlePrevious,
    handleNext,
    handleToday,
  };
}
