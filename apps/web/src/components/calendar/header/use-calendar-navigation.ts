import { useCallback } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { calendarViewAtom, currentDateAtom } from "@/atoms/view-preferences";
import { navigateToNext, navigateToPrevious } from "../utils/date-time";

export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
  const view = useAtomValue(calendarViewAtom);
  const settings = useAtomValue(calendarSettingsAtom);

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
