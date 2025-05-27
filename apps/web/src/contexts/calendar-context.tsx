"use client";

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { CalendarView } from "@/components/event-calendar";

interface CalendarContextType {
  currentDate: Date;
  setCurrentDate: Dispatch<SetStateAction<Date>>;
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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>(initialView);

  const value = {
    currentDate,
    setCurrentDate,
    view,
    setView,
  };

  return (
    <CalendarContext.Provider value={value}>
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
