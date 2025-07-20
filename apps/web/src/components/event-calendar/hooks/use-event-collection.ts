import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { startOfWeek } from "@repo/temporal";
import { eachDayOfInterval, isWeekend } from "@repo/temporal/v2";

import {
  useCalendarSettings,
  useDefaultTimeZone,
} from "@/atoms/calendar-settings";
import { useViewPreferences } from "@/atoms/view-preferences";
import {
  calculateWeekViewEventPositions,
  getAllDayEventCollectionsForDays,
  getEventCollectionsForDay,
  isAllDayOrMultiDay,
  type PositionedEvent,
} from "@/components/event-calendar/utils";
import { StartHour, WeekCellsHeight } from "../constants";
import type { CalendarEvent } from "../types";
import { EventCollectionItem } from "./event-collection";

export type AllDayCalendarEvent = CalendarEvent & {
  start: Temporal.PlainDate;
  end: Temporal.PlainDate;
};

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

// Day view specific processing
function getOptimizedDayViewEvents(
  items: EventCollectionItem[],
  day: Temporal.PlainDate,
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

  const allDayEvents = relevantItems.filter((item) =>
    isAllDayOrMultiDay(item, timeZone),
  );

  // Use the week view positioning logic but for a single day
  const positionedEvents = calculateWeekViewEventPositions(
    relevantItems,
    [day],
    WeekCellsHeight,
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

export type EventCollectionForDay = {
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
  const timeZone = useDefaultTimeZone();

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
      const eventsByDay = getEventCollectionsForMonthSimple(
        eventItems,
        days,
        timeZone,
      );
      return {
        type: "month" as const,
        eventsByDay,
      };
    }

    const { allDayEvents, positionedEvents } = getOptimizedWeekViewEvents(
      eventItems,
      days,
      timeZone,
    );
    return {
      type: "week" as const,
      allDayEvents,
      positionedEvents,
    };
  }, [eventItems, daysOrDay, viewType, timeZone]);
}

function filterWeekViewEvents(
  items: EventCollectionItem[],
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  timeZone: string,
): EventCollectionItem[] {
  return items.filter((item) => {
    const eventStart = item.start;

    // All-day events have an exclusive end; subtract one day so the final day is included
    const eventEnd = item.end;
    // Get all days that this event spans within the week
    const eventDays = eachDayOfInterval(
      Temporal.PlainDate.compare(eventStart, start) === -1 ? start : eventStart,
      Temporal.PlainDate.compare(eventEnd, end) === 1 ? end : eventEnd,
      { timeZone },
    );

    // Check if event has at least one day that's not a weekend
    const hasNonWeekendDay = eventDays.some((day) => !isWeekend(day));

    return hasNonWeekendDay;
  });
}

export function useWeekViewEventCollection(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
  timeZone: string,
): EventCollectionForWeek {
  const viewPreferences = useViewPreferences();

  // return useMemo(() => {
  //   if (items.length === 0) {
  //     return {
  //       type: "week" as const,
  //       allDayEvents: [],
  //       positionedEvents: [],
  //     };
  //   }

  //   const { allDayEvents, positionedEvents } = getOptimizedWeekViewEvents(
  //     items,
  //     days,
  //     timeZone,
  //   );

  //   return {
  //     type: "week" as const,
  //     allDayEvents,
  //     positionedEvents,
  //   };
  // }, [items, days, timeZone]);

  return useMemo(() => {
    if (items.length === 0) {
      return {
        type: "week" as const,
        allDayEvents: [],
        positionedEvents: [],
      };
    }

    const { allDayEvents, positionedEvents } = getOptimizedWeekViewEvents(
      items,
      days,
      timeZone,
    );

    if (!viewPreferences.showWeekends) {
      const filteredAllDayEvents = filterWeekViewEvents(
        allDayEvents,
        days[0]!,
        days[days.length - 1]!,
        timeZone,
      );

      return {
        type: "week" as const,
        allDayEvents: filteredAllDayEvents,
        positionedEvents,
      };
    }

    return {
      type: "week" as const,
      allDayEvents,
      positionedEvents,
    };
  }, [items, days, timeZone, viewPreferences.showWeekends]);
}
