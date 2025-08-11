import { useAtom } from "jotai";

import { calendarViewAtom, currentDateAtom } from "@/atoms/view-preferences";

export function useCalendarState() {
  const [currentDate, setCurrentDate] = useAtom(currentDateAtom);
  const [view, setView] = useAtom(calendarViewAtom);

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
  };
}
