import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { cellHeightAtom } from "@/atoms/cell-height";
import {
  calculateWeekViewEventPositions,
  getAllDayEventCollectionsForDays,
  getEventCollectionsForDay,
  isAllDayOrMultiDay,
  type PositionedEvent,
} from "@/components/calendar/utils/event";
import { EventCollectionItem } from "./event-collection";

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
    return (
      Temporal.PlainDate.compare(eventEnd, startDate) >= 0 &&
      Temporal.PlainDate.compare(eventStart, endDate) <= 0
    );
  });
}

// Simple per-day processing for month view (keeps code easy to reason about)
function getEventCollectionsForMonthSimple(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
): Map<string, EventCollectionByDay> {
  const map = new Map<string, EventCollectionByDay>();

  if (days.length === 0) {
    return map;
  }

  // Pre-filter events to those that can possibly overlap with the visible range
  const startDate = days[0]!;
  const endDate = days[days.length - 1]!;
  const relevant = preFilterEventsByDateRange(items, startDate, endDate);

  for (const day of days) {
    map.set(day.toString(), getEventCollectionsForDay(relevant, day));
  }

  return map;
}

// Optimized week view processing
function getOptimizedWeekViewEvents(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
  cellHeight: number,
  timeZone: string,
): {
  allDayEvents: EventCollectionItem[];
  positionedEvents: PositionedEvent[][];
} {
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

  const allDayEvents = getAllDayEventCollectionsForDays(relevantItems, days);

  const positionedEvents = calculateWeekViewEventPositions(
    relevantItems,
    days,
    cellHeight,
    timeZone,
  );

  return { allDayEvents, positionedEvents };
}

// Day view specific processing
function getOptimizedDayViewEvents(
  items: EventCollectionItem[],
  day: Temporal.PlainDate,
  cellHeight: number,
  timeZone: string,
): {
  allDayEvents: EventCollectionItem[];
  positionedEvents: PositionedEvent[];
} {
  // Filter events for this specific day
  const relevantItems = items.filter((item) => {
    const eventStart = item.start.toPlainDate();
    const eventEnd = item.end.toPlainDate();

    // Check if event overlaps with the day
    return (
      Temporal.PlainDate.compare(eventEnd, day) >= 0 &&
      Temporal.PlainDate.compare(eventStart, day) <= 0
    );
  });

  // Early return if no relevant events
  if (relevantItems.length === 0) {
    return {
      allDayEvents: [],
      positionedEvents: [],
    };
  }

  const allDayEvents = relevantItems.filter((item) => isAllDayOrMultiDay(item));

  // Use the week view positioning logic but for a single day
  const positionedEvents = calculateWeekViewEventPositions(
    relevantItems,
    [day],
    cellHeight,
    timeZone,
  );

  return {
    allDayEvents,
    positionedEvents: positionedEvents[0] || [],
  };
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

type EventCollectionForDay = {
  type: "day";
  allDayEvents: EventCollectionItem[];
  positionedEvents: PositionedEvent[];
};

export function useEventCollection(
  eventItems: EventCollectionItem[],
  days: Temporal.PlainDate[],
  viewType: "month",
): EventCollectionForMonth;

export function useEventCollection(
  eventItems: EventCollectionItem[],
  days: Temporal.PlainDate[],
  viewType: "week",
): EventCollectionForWeek;

export function useEventCollection(
  eventItems: EventCollectionItem[],
  day: Temporal.PlainDate,
  viewType: "day",
): EventCollectionForDay;

/**
 * Hook for processing and organizing events based on calendar view type
 *
 * @param eventItems - Array of EventCollectionItem objects to process
 * @param days - Array of Date objects representing the visible days (or single date for day view)
 * @param viewType - Type of calendar view ("month", "week", or "day")
 * @returns Processed event collections optimized for the specific view
 */
export function useEventCollection(
  eventItems: EventCollectionItem[],
  daysOrDay: Temporal.PlainDate[] | Temporal.PlainDate,
  viewType: "month" | "week" | "day",
): EventCollectionForMonth | EventCollectionForWeek | EventCollectionForDay {
  const timeZone = useAtomValue(calendarSettingsAtom).defaultTimeZone;
  const cellHeight = useAtomValue(cellHeightAtom);

  return useMemo(() => {
    // Early return for empty inputs
    if (eventItems.length === 0) {
      if (viewType === "month") {
        return {
          type: "month" as const,
          eventsByDay: new Map(),
        };
      }
      if (viewType === "week") {
        return {
          type: "week" as const,
          allDayEvents: [],
          positionedEvents: [],
        };
      }
      return {
        type: "day" as const,
        allDayEvents: [],
        positionedEvents: [],
      };
    }

    if (viewType === "day") {
      const day = daysOrDay as Temporal.PlainDate;
      const { allDayEvents, positionedEvents } = getOptimizedDayViewEvents(
        eventItems,
        day,
        cellHeight,
        timeZone,
      );
      return {
        type: "day" as const,
        allDayEvents,
        positionedEvents,
      };
    }

    const days = daysOrDay as Temporal.PlainDate[];

    if (days.length === 0) {
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

    if (viewType === "month") {
      const eventsByDay = getEventCollectionsForMonthSimple(eventItems, days);
      return {
        type: "month" as const,
        eventsByDay,
      };
    }

    const { allDayEvents, positionedEvents } = getOptimizedWeekViewEvents(
      eventItems,
      days,
      cellHeight,
      timeZone,
    );

    return {
      type: "week" as const,
      allDayEvents,
      positionedEvents,
    };
  }, [eventItems, daysOrDay, viewType, timeZone, cellHeight]);
}
