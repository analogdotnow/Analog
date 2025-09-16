"use client";

import * as React from "react";
import { isWithinInterval } from "interval-temporal";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import {
  eachDayOfInterval,
  isAfter,
  isBefore,
  isWeekend,
} from "@repo/temporal";

import { CalendarSettings } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { useMultiDayOverflow } from "@/components/calendar/hooks/use-multi-day-overflow";
import { EventCollectionItem } from "../hooks/event-collection";
import { EventCollectionForMonth } from "../hooks/use-event-collection";
import { MemoizedMonthViewDay } from "./month-view-day";
import { MemoizedPositionedEvent } from "./month-view-positioned-event";

interface MonthViewWeekItemProps {
  week: Temporal.PlainDate[];
  weekIndex: number;
  rows: number;
  eventCollection: EventCollectionForMonth;

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

  const weekEvents = React.useMemo(() => {
    // Collect all events from the event collection - treat ALL events as multi-day
    const allEvents: EventCollectionItem[] = [];
    eventCollection.eventsByDay.forEach((dayEvents) => {
      allEvents.push(...dayEvents.allEvents);
    });
    const uniqueEvents = allEvents.filter(
      (event, index, self) =>
        index === self.findIndex((e) => e.event.id === event.event.id),
    );

    // Include ALL events in the multi-day lane, not just spanning events
    return uniqueEvents.filter((item) => {
      const eventStart = item.start.toPlainDate();
      const eventEnd = item.end.toPlainDate();

      // All-day events have an exclusive end; subtract one day so the final day is included

      // Check if event is within the week range
      const isInWeek =
        isWithinInterval(eventStart, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(eventEnd, { start: weekStart, end: weekEnd });

      if (!isInWeek) {
        return false;
      }

      // If weekends are hidden, exclude events that only occur on weekends
      if (!viewPreferences.showWeekends) {
        // Get all days that this event spans within the week
        const eventDays = eachDayOfInterval(
          isBefore(eventStart, weekStart) ? weekStart : eventStart,
          isAfter(eventEnd, weekEnd) ? weekEnd : eventEnd,
        );

        // Check if event has at least one day that's not a weekend
        const hasNonWeekendDay = eventDays.some((day) => !isWeekend(day));

        if (!hasNonWeekendDay) {
          return false;
        }
      }

      return true;
    });
  }, [
    eventCollection.eventsByDay,
    viewPreferences.showWeekends,
    weekStart,
    weekEnd,
  ]);

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
      {/* 1. Day cells */}
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

      {/* 2. Multi-day event overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-7.5 bottom-0 grid min-w-0 auto-rows-max grid-cols-(--month-view-grid)">
        {/* Render only visible events */}
        {overflow.capacityInfo.visibleLanes.map((lane, y) =>
          lane.map((item) => {
            return (
              <MemoizedPositionedEvent
                key={item.event.id}
                rows={rows}
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
