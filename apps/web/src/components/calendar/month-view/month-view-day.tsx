"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isSameMonth, isToday, isWeekend } from "@repo/temporal";

import { OverflowPopover } from "@/components/calendar/overflow/overflow-popover";
import { itemsStartingOn } from "@/components/calendar/utils/event";
import { useCreateDefaultEventAction } from "@/hooks/calendar/drag-and-drop/use-double-click-to-create";
import type { InlineDisplayItem } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { format } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

interface MonthViewDayProps {
  children?: React.ReactNode;
  date: Temporal.PlainDate;
  overflowRef: React.RefObject<HTMLDivElement | null>;
}

export function MonthViewDay({
  children,
  date,
  overflowRef,
}: MonthViewDayProps) {
  "use memo";

  return (
    <MemorizedMonthViewDayContainer date={date}>
      <MemorizedMonthViewDayHeader date={date} />
      <div
        className="flex grow flex-col justify-end place-self-stretch"
        ref={overflowRef}
      />
      {children}
    </MemorizedMonthViewDayContainer>
  );
}

export const MemoizedMonthViewDay = React.memo(MonthViewDay);

interface MonthViewDayHeaderProps {
  date: Temporal.PlainDate;
}

function MonthViewDayHeader({ date }: MonthViewDayHeaderProps) {
  "use memo";

  const defaultTimeZone = useDefaultTimeZone();

  return (
    <div
      className={cn(
        "relative mt-1 ml-0.5 inline-flex size-6 items-center justify-center rounded-sm text-sm",
        isToday(date, { timeZone: defaultTimeZone }) &&
          "border border-blue-600 bg-linear-to-b from-blue-500 to-blue-600 text-blue-50",
      )}
    >
      {format(date, "D", defaultTimeZone)}
    </div>
  );
}

const MemorizedMonthViewDayHeader = React.memo(MonthViewDayHeader);

interface MonthViewDayContainerProps {
  children: React.ReactNode;
  date: Temporal.PlainDate;
}

function MonthViewDayContainer({ children, date }: MonthViewDayContainerProps) {
  "use memo";

  // const currentDate = useCalendarStore((s) => s.currentDate);
  const showWeekends = useCalendarStore((s) => s.viewPreferences.showWeekends);

  const createDefaultEventAction = useCreateDefaultEventAction();

  if (!showWeekends && isWeekend(date)) {
    return null;
  }

  return (
    <div
      className={cn(
        "group relative flex min-w-0 flex-col justify-between gap-0.5 border-r border-b border-border/70 last:border-r-0",
        // !isSameMonth(date, currentDate) &&
        //   "text-muted-foreground/70",
      )}
      onDoubleClick={() =>
        createDefaultEventAction({ start: date, allDay: false })
      }
    >
      {children}
    </div>
  );
}

const MemorizedMonthViewDayContainer = React.memo(MonthViewDayContainer);

interface MonthViewDayOverflowProps {
  items: InlineDisplayItem[];
  date: Temporal.PlainDate;
}

export function MonthViewDayOverflow({
  items,
  date,
}: MonthViewDayOverflowProps) {
  "use memo";

  const dayOverflowItems = itemsStartingOn(items, date);

  if (dayOverflowItems.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-auto z-10 flex flex-col items-center place-self-stretch pb-1">
      <OverflowPopover items={dayOverflowItems} date={date} />
    </div>
  );
}

export const MemoizedMonthViewDayOverflow = React.memo(MonthViewDayOverflow);
