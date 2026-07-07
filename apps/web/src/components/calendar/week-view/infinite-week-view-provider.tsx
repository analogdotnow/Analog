"use client";

import * as React from "react";
import type { Temporal } from "temporal-polyfill";

import { eachDayOfInterval } from "@repo/temporal";

import {
  useWeekDisplayCollection,
  type WeekDisplayCollection,
} from "@/hooks/calendar/use-event-collection";
import type { DisplayItem } from "@/lib/display-item";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useCurrentDate, useDisplayedDays } from "@/store/hooks";

interface InfiniteWeekViewContextValue {
  items: DisplayItem[];
  collection: {
    items: WeekDisplayCollection;
    range: {
      start: Temporal.PlainDate;
      end: Temporal.PlainDate;
      days: Temporal.PlainDate[];
    };
  };
  view: {
    columns: number;
    range: {
      start: Temporal.PlainDate;
      end: Temporal.PlainDate;
    };
  };
}

const InfiniteWeekViewContext =
  React.createContext<InfiniteWeekViewContextValue | null>(null);

interface InfiniteWeekViewProviderProps {
  children: React.ReactNode;
  items: DisplayItem[];
}

export function InfiniteWeekViewProvider({
  children,
  items,
}: InfiniteWeekViewProviderProps) {
  "use memo";

  const currentDate = useCurrentDate();
  const displayedDays = useDisplayedDays();
  const start = useCalendarStore((s) => s.timeMin);
  const end = useCalendarStore((s) => s.timeMax);
  const days = eachDayOfInterval(start, end);

  const view = React.useMemo(() => {
    return {
      columns: displayedDays,
      range: {
        start: currentDate,
        end: currentDate.add({ days: displayedDays - 1 }),
      },
    };
  }, [displayedDays, currentDate]);

  const collection = useWeekDisplayCollection(items, days, true);

  const value = React.useMemo(
    () => ({
      items,
      collection: {
        items: collection,
        range: { start, end, days },
      },
      view,
    }),
    [collection, start, end, days, view, items],
  );

  return (
    <InfiniteWeekViewContext value={value}>{children}</InfiniteWeekViewContext>
  );
}

export function useInfiniteWeekView() {
  const context = React.use(InfiniteWeekViewContext);

  if (!context) {
    throw new Error(
      "useInfiniteWeekView must be used within an InfiniteWeekViewProvider",
    );
  }

  return context;
}
