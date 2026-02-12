"use client";

import * as React from "react";
import type { Temporal } from "temporal-polyfill";

import { eachDayOfInterval } from "@repo/temporal";

import {
  useWeekDisplayCollection,
  type WeekDisplayCollection,
} from "@/hooks/calendar/use-event-collection";
import type { DisplayItem } from "@/lib/display-item";
import { useAnchor, useDisplayedDays } from "@/store/hooks";

export const BUFFER_DAYS = 150;

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

  const anchor = useAnchor();
  const displayedDays = useDisplayedDays();

  const range = React.useMemo(() => {
    const start = anchor.subtract({ days: BUFFER_DAYS });
    const end = anchor.add({ days: displayedDays + BUFFER_DAYS - 1 });
    const days = eachDayOfInterval(start, end);

    return { start, end, days };
  }, [anchor, displayedDays]);

  const view = React.useMemo(() => {
    return {
      columns: displayedDays,
      range: {
        start: anchor,
        end: anchor.add({ days: displayedDays - 1 }),
      },
    };
  }, [displayedDays, anchor]);

  const collection = useWeekDisplayCollection(items, range.days, true);

  const value = React.useMemo(
    () => ({
      items,
      collection: {
        items: collection,
        range,
      },
      view,
    }),
    [collection, range, view, items],
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
