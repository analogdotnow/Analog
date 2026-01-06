"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isWeekend } from "@repo/temporal";

import { CalendarSettings } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { useMultiDayOverflow } from "@/components/calendar/hooks/use-multi-day-overflow";
import {
  useWeekRowEvents,
  type MonthEventCollection,
} from "../hooks/use-event-collection";
import { MemoizedMonthViewDay } from "./month-view-day";
import { MemoizedPositionedEvent } from "./month-view-positioned-event";

interface MonthViewWeekItemProps {
  week: Temporal.PlainDate[];
  weekIndex: number;
  rows: number;
  eventCollection: MonthEventCollection;

  settings: CalendarSettings;
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentDate: Temporal.PlainDate;
}

export function MonthViewWeek({
  week,
  weekIndex,
  rows,
  eventCollection,
  settings,
  containerRef,
  currentDate,
}: MonthViewWeekItemProps) {
  const weekRef = React.useRef<HTMLDivElement>(null);
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const weekStart = week[0]!;
  const weekEnd = week[6]!;
  const visibleDays = React.useMemo(() => {
    return week.filter(
      (day) => viewPreferences.showWeekends || !isWeekend(day),
    );
  }, [viewPreferences.showWeekends, week]);

  const weekEvents = useWeekRowEvents(eventCollection, weekStart, weekEnd);

  const overflowRef = React.useRef<HTMLDivElement | null>(null);
  // Use overflow hook to manage event display
  const overflow = useMultiDayOverflow({
    events: weekEvents,
    timeZone: settings.defaultTimeZone,
    containerRef: overflowRef,
  });

  return (
    <div
      key={`week-${weekIndex}`}
      ref={weekRef}
      className="relative grid min-w-0 grid-cols-(--month-view-grid) transition-[grid-template-columns] duration-200 ease-linear [&:last-child>*]:border-b-0"
    >
      {week.map((day, dayIndex) => (
        <MemoizedMonthViewDay
          key={day.toString()}
          day={day}
          dayIndex={dayIndex}
          overflow={overflow}
          currentDate={currentDate}
          overflowRef={overflowRef}
        />
      ))}

      <div className="pointer-events-none absolute inset-x-0 top-7.5 bottom-0 grid min-w-0 auto-rows-max grid-cols-(--month-view-grid)">
        {overflow.capacityInfo.visibleLanes.map((lane, y) =>
          lane.map((item) => {
            return (
              <MemoizedPositionedEvent
                key={item.event.id}
                rows={rows}
                columns={visibleDays.length}
                y={y}
                item={item}
                weekStart={weekStart}
                weekEnd={weekEnd}
                containerRef={containerRef}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

export const MemorizedMonthViewWeek = React.memo(MonthViewWeek);
