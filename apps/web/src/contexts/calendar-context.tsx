"use client";

import React, { createContext, useContext } from "react";
import { CalendarView } from "@/components/event-calendar";
import { useCalendarState } from "@/hooks/use-calendar-state";

interface CalendarContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: CalendarView;
  setView: (view: CalendarView) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(
  undefined
);

export function CalendarProvider({
  children,
  initialView = "week",
}: {
  children: React.ReactNode;
  initialView?: CalendarView;
}) {
  const calendarState = useCalendarState(initialView);

  return (
    <CalendarContext.Provider value={calendarState}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error(
      "useCalendarContext must be used within a CalendarProvider"
    );
  }
  return context;
}

export function useCalendarContextOptional() {
  return useContext(CalendarContext);
}
