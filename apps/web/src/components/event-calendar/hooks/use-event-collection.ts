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
    const items = mapEventsToItems(events, timeZone);
    if (viewType === "month") {
      const eventsByDay = new Map<string, EventCollectionByDay>();

      for (const day of days) {
        const dayEvents = getEventCollectionsForDay(items, day, timeZone);

        eventsByDay.set(day.toString(), dayEvents);
      }

      return {
        type: "month" as const,
        eventsByDay,
      };
    }

    const allDayEvents = getAllDayEventCollectionsForDays(
      items,
      days,
      timeZone,
    );

    const positionedEvents = calculateWeekViewEventPositions(
      items,
      days,
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

function useEventCollectionForDay(
  events: CalendarEvent[],
  day: Temporal.PlainDate,
  timeZone: string,
): EventCollectionByDay {
  return useMemo(() => {
    const items = mapEventsToItems(events, timeZone);
    return getEventCollectionsForDay(items, day, timeZone);
  }, [events, day, timeZone]);
}

function useEventCollectionForMonth(
  events: CalendarEvent[],
  days: Temporal.PlainDate[],
  timeZone: string,
): EventCollectionForWeek {
  return useMemo(() => {
    const items = mapEventsToItems(events, timeZone);
    return getEventCollectionsForWeek(items, days, timeZone);
  }, [events, days, timeZone]);
}
