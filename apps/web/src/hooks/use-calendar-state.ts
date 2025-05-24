"use client";

import { useState } from "react";
import { CalendarView } from "@/components/event-calendar";

export function useCalendarState(initialView: CalendarView = "week") {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  return {
    currentDate,
    setCurrentDate,
    view,
    setView,
  };
}
