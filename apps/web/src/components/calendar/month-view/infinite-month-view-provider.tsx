"use client";

import * as React from "react";

import type { DisplayItem } from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";

interface InfiniteMonthViewContextValue {
  view: {
    columns: number;
  };
  items: DisplayItem[];
}

const InfiniteMonthViewContext =
  React.createContext<InfiniteMonthViewContextValue | null>(null);
InfiniteMonthViewContext.displayName = "InfiniteMonthViewContext";

interface InfiniteMonthViewProviderProps {
  children: React.ReactNode;
  items: DisplayItem[];
}

export function InfiniteMonthViewProvider({
  children,
  items,
}: InfiniteMonthViewProviderProps) {
  "use memo";

  const showWeekends = useCalendarStore((s) => s.viewPreferences.showWeekends);

  const value = React.useMemo(
    () => ({
      items,
      view: {
        columns: showWeekends ? 7 : 5,
      },
    }),
    [showWeekends, items],
  );

  return (
    <InfiniteMonthViewContext value={value}>
      {children}
    </InfiniteMonthViewContext>
  );
}

export function useInfiniteMonthView() {
  const context = React.use(InfiniteMonthViewContext);

  if (!context) {
    throw new Error(
      "useInfiniteMonthView must be used within an InfiniteMonthViewProvider",
    );
  }

  return context;
}
