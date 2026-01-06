"use client";

import * as React from "react";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isSameMonth, isToday, isWeekend, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { useDoubleClickToCreate } from "@/components/calendar/hooks/drag-and-drop/use-double-click-to-create";
import type { UseMultiDayOverflowResult } from "@/components/calendar/hooks/use-multi-day-overflow";
import { OverflowIndicator } from "@/components/calendar/overflow/overflow-indicator";
import { eventsStartingOn } from "@/components/calendar/utils/event";
import { cn } from "@/lib/utils";

interface MonthViewDayProps {
  day: Temporal.PlainDate;
  dayIndex: number;
  overflow: UseMultiDayOverflowResult;
  overflowRef: React.RefObject<HTMLDivElement | null>;
  currentDate: Temporal.PlainDate;
}

export function MonthViewDay({
  day,
  dayIndex,
  overflow,
  overflowRef,
  currentDate,
}: MonthViewDayProps) {
  return (
    <MemorizedMonthViewCell
      day={day}
      currentDate={currentDate}
      dayIndex={dayIndex}
    >
      <MemorizedMonthViewDayHeader day={day} />

      <div
        className="flex grow flex-col justify-end place-self-stretch"
        ref={overflowRef}
      />

      <MemorizedMonthViewDayOverflow overflow={overflow} day={day} />
    </MemorizedMonthViewCell>
  );
}

export const MemoizedMonthViewDay = React.memo(MonthViewDay);

interface MonthViewDayHeaderProps {
  day: Temporal.PlainDate;
}

function MonthViewDayHeader({ day }: MonthViewDayHeaderProps) {
  const timeZone = useAtomValue(calendarSettingsAtom).defaultTimeZone;

  const { label, today } = React.useMemo(() => {
    const date = toDate(day, { timeZone });

    return {
      label: format(date, "d"),
      today: isToday(day, { timeZone }) || undefined,
    };
  }, [day, timeZone]);

  return (
    <div
      className={cn(
        "relative mt-1 ml-0.5 inline-flex size-6 items-center justify-center rounded-sm text-sm",
        today &&
          "border border-blue-600 bg-linear-to-b from-blue-500 to-blue-600 text-blue-50",
      )}
    >
      {label}
    </div>
  );
}

const MemorizedMonthViewDayHeader = React.memo(MonthViewDayHeader);

interface MonthViewCellProps {
  children: React.ReactNode;
  className?: string;
  day: Temporal.PlainDate;
  currentDate: Temporal.PlainDate;
  dayIndex: number;
}

function MonthViewCell({
  children,
  day,
  currentDate,
  dayIndex,
}: MonthViewCellProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);

  const onDoubleClick = useDoubleClickToCreate({
    date: day,
  });

  const isCurrentMonth = React.useMemo(
    () => isSameMonth(day, currentDate),
    [day, currentDate],
  );

  const isDayVisible = React.useMemo(
    () => viewPreferences.showWeekends || !isWeekend(day),
    [viewPreferences.showWeekends, day],
  );

  // Determine if this day is in the last visible column
  const isLastVisibleColumn = viewPreferences.showWeekends
    ? dayIndex === 6 // Saturday is last when weekends shown
    : dayIndex === 5; // Friday is last when weekends hidden

  return (
    <div
      className={cn(
        "group relative min-w-0 border-b border-border/70 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70",
        !isLastVisibleColumn && "border-r",
        !isDayVisible && "hidden w-0",
      )}
      data-outside-cell={!isCurrentMonth || undefined}
    >
      <div
        id={`month-cell-${day.toString()}`}
        onDoubleClick={onDoubleClick}
        className="flex h-full flex-col justify-between gap-0.5"
      >
        {children}
      </div>
    </div>
  );
}

const MemorizedMonthViewCell = React.memo(MonthViewCell);

interface MonthViewDayOverflowProps {
  overflow: UseMultiDayOverflowResult;
  day: Temporal.PlainDate;
}

function MonthViewDayOverflow({ overflow, day }: MonthViewDayOverflowProps) {
  // Filter overflow events to only show those that start on this day
  const dayOverflowEvents = React.useMemo(
    () => eventsStartingOn(overflow.overflowEvents, day),
    [overflow.overflowEvents, day],
  );

  if (dayOverflowEvents.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-auto z-10 flex flex-col items-center place-self-stretch pb-1">
      <OverflowIndicator items={dayOverflowEvents} date={day} />
    </div>
  );
}

const MemorizedMonthViewDayOverflow = React.memo(MonthViewDayOverflow);
