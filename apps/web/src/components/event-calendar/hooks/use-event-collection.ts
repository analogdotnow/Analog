import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { useDefaultTimeZone } from "@/atoms/calendar-settings";
import {
  calculateWeekViewEventPositions,
  getAllDayEventCollectionsForDays,
  getEventCollectionsForDay,
  type PositionedEvent,
} from "@/components/event-calendar/utils";
import { StartHour, WeekCellsHeight } from "../constants";
import type { CalendarEvent } from "../types";

export type AllDayCalendarEvent = CalendarEvent & {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
};

export type TimedCalendarEvent = CalendarEvent & {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

export type EventCollectionItem = {
  event: CalendarEvent;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
};

function convertToZonedDateTime(
  value: Temporal.PlainDate | Temporal.ZonedDateTime | Temporal.Instant,
  timeZone: string,
): Temporal.ZonedDateTime {
  if (value instanceof Temporal.PlainDate) {
    return value.toZonedDateTime({ timeZone });
  }
  if (value instanceof Temporal.Instant) {
    return value.toZonedDateTimeISO(timeZone);
  }

  return value.withTimeZone(timeZone);
}

function mapEventsToItems(
  events: CalendarEvent[],
  timeZone: string,
): EventCollectionItem[] {
  return events.map((event) => ({
    event,
    start: convertToZonedDateTime(event.start, timeZone),
    end: convertToZonedDateTime(event.end, timeZone).subtract({ seconds: 1 }),
  }));
}

// Pre-filter events by date range to avoid processing irrelevant events
function preFilterEventsByDateRange(
  items: EventCollectionItem[],
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
): EventCollectionItem[] {
  return items.filter((item) => {
    const eventStart = item.start.toPlainDate();
    const eventEnd = item.end.toPlainDate();

    // Check if event overlaps with the date range
    return Temporal.PlainDate.compare(eventEnd, startDate) >= 0 &&
           Temporal.PlainDate.compare(eventStart, endDate) <= 0;
  });
}

// Simple per-day processing for month view (keeps code easy to reason about)
function getEventCollectionsForMonthSimple(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
  timeZone: string,
): Map<string, EventCollectionByDay> {
  const map = new Map<string, EventCollectionByDay>();

  if (days.length === 0) return map;

  // Pre-filter events to those that can possibly overlap with the visible range
  const startDate = days[0]!;
  const endDate = days[days.length - 1]!;
  const relevant = preFilterEventsByDateRange(items, startDate, endDate);

  for (const day of days) {
    map.set(day.toString(), getEventCollectionsForDay(relevant, day, timeZone));
  }

  return map;
}

// Optimized week view processing
function getOptimizedWeekViewEvents(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
  timeZone: string,
): { allDayEvents: EventCollectionItem[]; positionedEvents: PositionedEvent[][] } {
  if (days.length === 0) return { allDayEvents: [], positionedEvents: [] };

  // Pre-filter events for the week range
  const startDate = days[0]!;
  const endDate = days[days.length - 1]!;
  const relevantItems = preFilterEventsByDateRange(items, startDate, endDate);

  // Early return if no relevant events
  if (relevantItems.length === 0) {
    return {
      allDayEvents: [],
      positionedEvents: days.map(() => []),
    };
  }

  const allDayEvents = getAllDayEventCollectionsForDays(
    relevantItems,
    days,
    timeZone,
  );

  const positionedEvents = calculateWeekViewEventPositions(
    relevantItems,
    days,
    WeekCellsHeight,
    timeZone,
  );

  return { allDayEvents, positionedEvents };
}

export type EventCollectionByDay = {
  dayEvents: EventCollectionItem[];
  spanningEvents: EventCollectionItem[];
  allDayEvents: EventCollectionItem[];
  allEvents: EventCollectionItem[];
};

export type EventCollectionForMonth = {
  type: "month";
  eventsByDay: Map<string, EventCollectionByDay>;
};

export type EventCollectionForWeek = {
  type: "week";
  allDayEvents: EventCollectionItem[];
  positionedEvents: PositionedEvent[][];
};

export function useEventCollection(
  events: CalendarEvent[],
  days: Temporal.PlainDate[],
  viewType: "month",
): EventCollectionForMonth;

export function useEventCollection(
  events: CalendarEvent[],
  days: Temporal.PlainDate[],
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
  days: Temporal.PlainDate[],
  viewType: "month" | "week",
): EventCollectionForMonth | EventCollectionForWeek {
  const timeZone = useDefaultTimeZone();

  return useMemo(() => {
    // Early return for empty inputs
    if (events.length === 0 || days.length === 0) {
      if (viewType === "month") {
        return {
          type: "month" as const,
          eventsByDay: new Map(),
        };
      }
      return {
        type: "week" as const,
        allDayEvents: [],
        positionedEvents: [],
      };
    }

    const items = mapEventsToItems(events, timeZone);

    if (viewType === "month") {
      const eventsByDay = getEventCollectionsForMonthSimple(items, days, timeZone);
      return {
        type: "month" as const,
        eventsByDay,
      };
    }

    const { allDayEvents, positionedEvents } = getOptimizedWeekViewEvents(items, days, timeZone);
    return {
      type: "week" as const,
      allDayEvents,
      positionedEvents,
    };
  },
    [events, days, viewType, timeZone],
  );
}
