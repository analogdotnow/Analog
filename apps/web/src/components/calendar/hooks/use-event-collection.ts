import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, isWeekend } from "@repo/temporal";

import { cellHeightAtom } from "@/atoms/cell-height";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import {
  calculateWeekViewEventPositions,
  getAllDayEventCollectionsForDays,
  getEventCollectionsForDay,
  type PositionedEvent,
} from "@/components/calendar/utils/positioning";
import { EventCollectionItem } from "./event-collection";

function preFilterEventsByDateRange(
  items: EventCollectionItem[],
  startDate: Temporal.PlainDate,
  endDate: Temporal.PlainDate,
) {
  return items.filter(({ start, end }) => {
    return (
      Temporal.PlainDate.compare(start.toPlainDate(), endDate) <= 0 &&
      Temporal.PlainDate.compare(end.toPlainDate(), startDate) >= 0
    );
  });
}

function isWithinWeekdayRange(
  item: EventCollectionItem,
  rangeStart: Temporal.PlainDate,
  rangeEnd: Temporal.PlainDate,
) {
  const eventStart = item.start.toPlainDate();
  const eventEnd = item.end.toPlainDate();
  const clampedStart = isBefore(eventStart, rangeStart)
    ? rangeStart
    : eventStart;
  const clampedEnd = isAfter(eventEnd, rangeEnd) ? rangeEnd : eventEnd;

  if (clampedStart.until(clampedEnd, { largestUnit: "days" }).days >= 2) {
    return true;
  }

  return !isWeekend(clampedStart) || !isWeekend(clampedEnd);
}

export interface EventCollectionByDay {
  dayEvents: EventCollectionItem[];
  spanningEvents: EventCollectionItem[];
  allDayEvents: EventCollectionItem[];
  allEvents: EventCollectionItem[];
}

export interface MonthEventCollection {
  eventsByDay: Map<string, EventCollectionByDay>;
}

export interface WeekEventCollection {
  allDayEvents: EventCollectionItem[];
  positionedEvents: PositionedEvent[][];
}

export function useMonthEventCollection(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
): MonthEventCollection {
  return useMemo(() => {
    if (items.length === 0 || days.length === 0) {
      return { eventsByDay: new Map() };
    }

    const events = preFilterEventsByDateRange(items, days.at(0)!, days.at(-1)!);
    const eventsByDay = new Map<string, EventCollectionByDay>();

    for (const day of days) {
      eventsByDay.set(day.toString(), getEventCollectionsForDay(events, day));
    }

    return { eventsByDay };
  }, [items, days]);
}

export function useWeekEventCollection(
  items: EventCollectionItem[],
  days: Temporal.PlainDate[],
): WeekEventCollection {
  const cellHeight = useAtomValue(cellHeightAtom);

  return useMemo(() => {
    if (items.length === 0 || days.length === 0) {
      return { allDayEvents: [], positionedEvents: [] };
    }

    const events = preFilterEventsByDateRange(items, days.at(0)!, days.at(-1)!);

    if (events.length === 0) {
      return { allDayEvents: [], positionedEvents: days.map(() => []) };
    }

    const allDayEvents = getAllDayEventCollectionsForDays(events, days);

    const positionedEvents = calculateWeekViewEventPositions({
      events,
      days,
      cellHeight,
    });

    return { allDayEvents, positionedEvents };
  }, [items, days, cellHeight]);
}

export function useWeekRowEvents(
  collection: MonthEventCollection,
  weekStart: Temporal.PlainDate,
  weekEnd: Temporal.PlainDate,
): EventCollectionItem[] {
  const { showWeekends } = useAtomValue(viewPreferencesAtom);

  return useMemo(() => {
    const uniqueEvents = new Map<string, EventCollectionItem>();

    let day = weekStart;

    while (Temporal.PlainDate.compare(day, weekEnd) <= 0) {
      const dayEvents = collection.eventsByDay.get(day.toString());

      if (dayEvents) {
        for (const item of dayEvents.allEvents) {
          uniqueEvents.set(item.event.id, item);
        }
      }

      day = day.add({ days: 1 });
    }

    if (showWeekends) {
      return [...uniqueEvents.values()];
    }

    return [...uniqueEvents.values()].filter((item) =>
      isWithinWeekdayRange(item, weekStart, weekEnd),
    );
  }, [collection.eventsByDay, showWeekends, weekStart, weekEnd]);
}
