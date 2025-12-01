"use client";

import * as React from "react";

interface CalendarPickerContextValue {
  isActionMenuOpen: boolean;
  setActionMenuOpen: (open: boolean) => void;
}

const CalendarPickerContext =
  React.createContext<CalendarPickerContextValue | null>(null);

interface CalendarPickerProviderProps {
  children: React.ReactNode;
}

export function CalendarPickerProvider({
  children,
}: CalendarPickerProviderProps) {
  "use memo";

  const [isActionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <CalendarPickerContext.Provider
      value={{ isActionMenuOpen, setActionMenuOpen }}
    >
      {children}
    </CalendarPickerContext.Provider>
  );
}

export function useCalendarPickerContext() {
  const context = React.useContext(CalendarPickerContext);

  if (!context) {
    throw new Error(
      "useCalendarPickerContext must be used within CalendarPickerProvider",
    );
  }

  return context;
}
