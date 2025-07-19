import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import {
  calculateWeekViewEventPositions,
  getAllDayEventCollectionsForDays,
  getEventCollectionsForDay,
  type PositionedEvent,
} from "@/components/event-calendar/utils";
import { StartHour, WeekCellsHeight } from "../constants";
import type { CalendarEvent } from "../types";
import { useDefaultTimeZone } from "@/atoms/calendar-settings";

export type AllDayCalendarEvent = CalendarEvent & {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
};

export type TimedCalendarEvent = CalendarEvent & {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

export type EventCollectionByDay = {
  dayEvents: CalendarEvent[];
  spanningEvents: CalendarEvent[];
  allDayEvents: CalendarEvent[];
  allEvents: CalendarEvent[];
};

export type EventCollectionForMonth = {
  type: "month";
  eventsByDay: Map<string, EventCollectionByDay>;
};

export type EventCollectionForWeek = {
  type: "week";
  allDayEvents: CalendarEvent[];
  positionedEvents: PositionedEvent[][];
};

export function useEventCollection(
  events: CalendarEvent[],
  days: Date[],
  viewType: "month",
): EventCollectionForMonth;

export function useEventCollection(
  events: CalendarEvent[],
  days: Date[],
  viewType: "week",
): EventCollectionForWeek;

/**
 * Hook for processing and organizing events based on calendar view type
 *
 * @param events - Array of calendar events to process
 * @param days - Array of Date objects representing the visible days
 * @param viewType - Type of calendar view ("month" or "week")
 * @returns Processed event collections optimized for the specific view
 */
export function useEventCollection(
  events: CalendarEvent[],
  days: Date[],
  viewType: "month" | "week",
): EventCollectionForMonth | EventCollectionForWeek {
  const timeZone = useDefaultTimeZone();

  return useMemo(() => {
    if (viewType === "month") {
      const eventsByDay = new Map<string, EventCollectionByDay>();

      for (const day of days) {
        const dayEvents = getEventCollectionsForDay(events, day, timeZone);

        eventsByDay.set(day.toString(), dayEvents);
      }

      return {
        type: "month" as const,
        eventsByDay,
      };
    }

    const allDayEvents = getAllDayEventCollectionsForDays(events, days, timeZone);
    const positionedEvents = calculateWeekViewEventPositions(
      events,
      days,
      StartHour,
      WeekCellsHeight,
      timeZone,
    );

    return {
      type: "week" as const,
      allDayEvents,
      positionedEvents,
    };
  }, [events, days, viewType, timeZone]);
}
