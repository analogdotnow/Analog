"use client";

import * as React from "react";
import type { Temporal } from "temporal-polyfill";

export interface WeekViewLayoutContextValue {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  dateFromPoint: (
    clientX: number,
    grabOffsetX?: number,
  ) => Temporal.PlainDate | null;
}

export const WeekViewLayoutContext =
  React.createContext<WeekViewLayoutContextValue | null>(null);
WeekViewLayoutContext.displayName = "WeekViewLayoutContext";

export function useWeekViewLayout() {
  const context = React.use(WeekViewLayoutContext);

  if (!context) {
    throw new Error(
      "useWeekViewLayout must be used within a WeekViewLayoutContext provider",
    );
  }

  return context;
}
