import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";
import * as t from "interval-temporal";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";
import * as T from "@repo/temporal/v2";

import { CalendarEvent } from "@/lib/interfaces";
import { EventCollectionItem } from "../hooks/event-collection";
import { EventCollectionByDay } from "../hooks/use-event-collection";

// ============================================================================
// CORE HELPERS
// ============================================================================

export function getEventDates(item: EventCollectionItem, timeZone: string) {
  return {
    start: toDate({ value: item.start, timeZone }),
    end: toDate({ value: item.end, timeZone }),
  };
}

export function eventOverlapsDay(
  item: EventCollectionItem,
  day: Temporal.PlainDate,
  timeZone: string,
): boolean {
  const start = item.start.toPlainDate();
  const end = item.end.toPlainDate();

  // For all-day events, the end date is exclusive, so we should not include it in the overlap check
  if (item.event.allDay) {
    const exclusiveEnd = end.subtract({ days: 1 });
    return (
      T.isSameDay(day, start) ||
      T.isSameDay(day, exclusiveEnd) ||
      (T.isAfter(day, start) && T.isBefore(day, exclusiveEnd))
    );
  }

  // For timed events, include the end day
  return (
    T.isSameDay(day, start) ||
    T.isSameDay(day, end) ||
    (T.isAfter(day, start) && T.isBefore(day, end))
  );
}

export function isAllDayOrMultiDay(
  item: EventCollectionItem,
  timeZone: string,
): boolean {
  return item.event.allDay || isMultiDayEvent(item, timeZone);
}

// ============================================================================
// CORE UTILITIES
// ============================================================================

export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function isMultiDayEvent(
  item: EventCollectionItem,
  timeZone: string,
): boolean {
  const { start, end } = getEventDates(item, timeZone);
  return item.event.allDay || start.getDate() !== end.getDate();
}

// ============================================================================
// EVENT FILTERING & QUERYING
// ============================================================================

export function filterPastEvents(
  events: EventCollectionItem[],
  showPastEvents: boolean,
  timeZone: string,
): EventCollectionItem[] {
  if (showPastEvents) return events;

  const now = new Date();
  return events.filter((event) => getEventDates(event, timeZone).end >= now);
}

export function filterVisibleEvents(
  events: CalendarEvent[],
  hiddenCalendars: string[],
): CalendarEvent[] {
  return events.filter((event) => !hiddenCalendars.includes(event.calendarId));
}

export function getEventsStartingOnDay(
  events: EventCollectionItem[],
  day: Date,
  timeZone: string,
): EventCollectionItem[] {
  return events
    .filter((event) => {
      const eventStart = toDate({ value: event.start, timeZone });
      return isSameDay(day, eventStart);
    })
    .sort(
      (a, b) =>
        toDate({ value: a.start, timeZone }).getTime() -
        toDate({ value: b.start, timeZone }).getTime(),
    );
}

export function getEventsStartingOnPlainDate(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  timeZone: string,
): EventCollectionItem[] {
  return events.filter((event) => {
    const eventStart = event.start.toPlainDate();
    return T.isSameDay(eventStart, day);
  });
}

export function getSpanningEventsForDay(
  items: EventCollectionItem[],
  day: Temporal.PlainDate,
  timeZone: string,
): EventCollectionItem[] {
  return items.filter((item) => {
    if (!isMultiDayEvent(item, timeZone)) return false;

    const start = item.start.toPlainDate();
    const end = item.end.toPlainDate();

    return (
      !T.isSameDay(day, start) &&
      (T.isSameDay(day, end) || (T.isAfter(day, start) && T.isBefore(day, end)))
    );
  });
}

export function getAllEventsForDay(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  timeZone: string,
): EventCollectionItem[] {
  return sortEventsByStartTime(
    events.filter((event) => eventOverlapsDay(event, day, timeZone)),
    timeZone,
  );
}

export function getEventSpanInfoForDay(
  item: EventCollectionItem,
  day: Date,
  timeZone: string,
) {
  const { start, end } = getEventDates(item, timeZone);
  return {
    eventStart: start,
    eventEnd: end,
    isFirstDay: isSameDay(day, start),
    isLastDay: isSameDay(day, end),
  };
}

/**
 * Get event collections for multiple days (pass single day as [day] for single-day use)
 */
export function getEventCollectionsForDay(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  timeZone: string,
) {
  const dayEvents: EventCollectionItem[] = [];
  const spanningEvents: EventCollectionItem[] = [];
  const allEvents: EventCollectionItem[] = [];

  events.forEach((event) => {
    if (!eventOverlapsDay(event, day, timeZone)) return;

    allEvents.push(event);
    const start = event.start.toPlainDate();

    if (T.isSameDay(day, start)) {
      dayEvents.push(event);
    } else if (isMultiDayEvent(event, timeZone)) {
      spanningEvents.push(event);
    }
  });

  return {
    dayEvents: sortEventsByStartTime(dayEvents, timeZone),
    spanningEvents: sortEventsByStartTime(spanningEvents, timeZone),
    allDayEvents: [
      ...sortEventsByStartTime(spanningEvents, timeZone),
      ...sortEventsByStartTime(dayEvents, timeZone),
    ],
    allEvents: sortEventsByStartTime(allEvents, timeZone),
  };
}

/**
 * Get aggregated all-day events for multiple days
 */
export function getAllDayEventCollectionsForDays(
  events: EventCollectionItem[],
  days: Temporal.PlainDate[],
  timeZone: string,
) {
  if (days.length === 0) {
    return [];
  }

  const allDayEvents = events
    .filter((event) => isAllDayOrMultiDay(event, timeZone))
    .filter((event) =>
      days.some((day) => eventOverlapsDay(event, day, timeZone)),
    );

  return sortEventsByStartTime(allDayEvents, timeZone);
}

// ============================================================================
// WEEK VIEW POSITIONING
// ============================================================================

export interface PositionedEvent {
  item: EventCollectionItem;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

interface EventColumn {
  item: EventCollectionItem;
  end: Temporal.ZonedDateTime;
}

function getTimedEventsForDay(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  timeZone: string,
): EventCollectionItem[] {
  return events.filter((event) => {
    if (isAllDayOrMultiDay(event, timeZone)) return false;
    return eventOverlapsDay(event, day, timeZone);
  });
}

function getAdjustedEventTimes(
  item: EventCollectionItem,
  day: Temporal.PlainDate,
  timeZone: string,
) {
  return {
    start: T.isSameDay(day, item.start, { timeZone })
      ? item.start
      : day.toZonedDateTime(timeZone).withPlainTime({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          microsecond: 0,
          nanosecond: 0,
        }),
    end: T.isSameDay(day, item.end, { timeZone })
      ? item.end
      : day.toZonedDateTime(timeZone).withPlainTime({
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
          microsecond: 999,
          nanosecond: 999,
        }),
  };
}

function calculateEventDimensions(
  adjustedStart: Temporal.ZonedDateTime,
  adjustedEnd: Temporal.ZonedDateTime,
  startHour: number,
  cellHeight: number,
) {
  const startHourValue = adjustedStart.hour + adjustedStart.minute / 60;
  const endHourValue = adjustedEnd.hour + adjustedEnd.minute / 60;

  return {
    top: (startHourValue - startHour) * cellHeight,
    height: (endHourValue - startHourValue) * cellHeight,
  };
}

function findEventColumn(
  item: EventCollectionItem,
  adjustedStart: Temporal.ZonedDateTime,
  adjustedEnd: Temporal.ZonedDateTime,
  columns: EventColumn[][],
  timeZone: string,
): number {
  let columnIndex = 0;

  while (true) {
    const column = columns[columnIndex] || [];

    if (column.length === 0) {
      columns[columnIndex] = column;
      return columnIndex;
    }

    const hasOverlap = column.some((c) => {
      return t.areIntervalsOverlapping(
        { start: adjustedStart, end: adjustedEnd },
        { start: c.item.start, end: c.item.end },
      );
    });

    if (!hasOverlap) {
      return columnIndex;
    }

    columnIndex++;
  }
}

function calculateEventLayout(
  columnIndex: number,
  totalColumns: number,
  eventsInGroup: number,
  groupIndex: number,
  overlapDepth: number,
  baseZIndex: number,
): { width: number; left: number; zIndex: number } {
  // Calculate width and offset based on overlap depth (each level reduces width by 10%)
  const offsetPercentage = overlapDepth * 0.1; // 10% offset per overlap level
  const availableWidth = 1 - offsetPercentage; // Reduce width by 10% per overlap level
  const leftOffset = offsetPercentage; // Start offset increases with depth

  // If events start within close proximity (handled by grouping), split available space equally
  if (eventsInGroup > 1) {
    const equalWidth = availableWidth / eventsInGroup;

    return {
      width: equalWidth,
      left: leftOffset + groupIndex * equalWidth,
      zIndex: baseZIndex + groupIndex, // Use chronological z-index + group position
    };
  }

  // For events that overlap with groups but aren't in a group
  if (overlapDepth > 0 && totalColumns >= 1) {
    return {
      width: availableWidth,
      left: leftOffset,
      zIndex: baseZIndex + 5 + columnIndex, // Slightly higher than group events
    };
  }

  // Single event with no overlaps
  return {
    width: 1,
    left: 0,
    zIndex: baseZIndex, // Use chronological z-index
  };
}

function positionEventsForDay(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  cellHeight: number,
  timeZone: string,
): PositionedEvent[] {
  const timedEvents = getTimedEventsForDay(events, day, timeZone);
  const sortedEvents = sortEventsForCollisionDetection(timedEvents, timeZone);
  const positioned: PositionedEvent[] = [];

  // Group events that start within 24px of each other
  const proximityThresholdHours = 40 / cellHeight;
  const eventGroups: EventCollectionItem[][] = [];

  for (const item of sortedEvents) {
    const { start } = getAdjustedEventTimes(item, day, timeZone);
    const startHourValue = start.hour + start.minute / 60;

    // Find existing group within proximity threshold
    let assignedGroup = false;
    for (const group of eventGroups) {
      if (group.length > 0) {
        const { start: groupStart, end: groupEnd } = getAdjustedEventTimes(
          group[0]!,
          day,
          timeZone,
        );
        const groupStartHourValue = groupStart.hour + groupStart.minute / 60;

        const groupEndTime = groupEnd.hour + groupEnd.minute / 60;

        if (
          Math.abs(startHourValue - groupStartHourValue) <=
            proximityThresholdHours &&
          startHourValue < groupEndTime // Only add if event starts before group ends
        ) {
          group.push(item);
          assignedGroup = true;
          break;
        }
      }
    }

    if (!assignedGroup) {
      eventGroups.push([item]);
    }
  }

  // Calculate cumulative overlap layers for chronological z-index
  let currentZLayer = 10;
  const groupZLayers: number[] = [];

  for (const [groupIdx, group] of eventGroups.entries()) {
    // Check if this group overlaps with any previous groups
    const hasOverlapWithPrevious = eventGroups
      .slice(0, groupIdx)
      .some((previousGroup) => {
        return group.some((groupEvent) => {
          const { start: groupStart, end: groupEnd } = getEventDates(
            groupEvent,
            timeZone,
          );
          return previousGroup.some((previousEvent) => {
            const { start: previousStart, end: previousEnd } = getEventDates(
              previousEvent,
              timeZone,
            );
            return areIntervalsOverlapping(
              { start: groupStart, end: groupEnd },
              { start: previousStart, end: previousEnd },
            );
          });
        });
      });

    if (hasOverlapWithPrevious) {
      currentZLayer += 10; // Increase layer for overlapping groups
    } else {
      currentZLayer = 10; // Reset when no overlap
    }

    groupZLayers[groupIdx] = currentZLayer;
  }

  // Process each group separately
  for (const [groupIdx, group] of eventGroups.entries()) {
    const columns: EventColumn[][] = [];

    // Calculate overlap depth - how many previous groups this group overlaps with
    const overlapDepth = eventGroups
      .slice(0, groupIdx)
      .filter((previousGroup) => {
        return group.some((groupEvent) => {
          const { start: groupStart, end: groupEnd } = getEventDates(
            groupEvent,
            timeZone,
          );
          return previousGroup.some((previousEvent) => {
            const { start: previousStart, end: previousEnd } = getEventDates(
              previousEvent,
              timeZone,
            );
            return areIntervalsOverlapping(
              { start: groupStart, end: groupEnd },
              { start: previousStart, end: previousEnd },
            );
          });
        });
      }).length;

    const baseZIndex = groupZLayers[groupIdx]!;

    for (const [groupIndex, item] of group.entries()) {
      const { start: adjustedStart, end: adjustedEnd } = getAdjustedEventTimes(
        item,
        day,
        timeZone,
      );
      const { top, height } = calculateEventDimensions(
        adjustedStart,
        adjustedEnd,
        0,
        cellHeight,
      );

      const columnIndex = findEventColumn(
        item,
        adjustedStart,
        adjustedEnd,
        columns,
        timeZone,
      );

      // Calculate total columns needed for this group
      const totalColumns = Math.max(
        columnIndex + 1,
        columns.filter((col) => col.length > 0).length,
      );

      const { width, left, zIndex } = calculateEventLayout(
        columnIndex,
        totalColumns,
        group.length,
        groupIndex,
        overlapDepth,
        baseZIndex,
      );

      const column = columns[columnIndex] || [];
      columns[columnIndex] = column;
      column.push({ item, end: adjustedEnd });

      positioned.push({
        item,
        top,
        height,
        left,
        width,
        zIndex,
      });
    }
  }

  return positioned;
}

export function calculateWeekViewEventPositions(
  events: EventCollectionItem[],
  days: Temporal.PlainDate[],
  cellHeight: number,
  timeZone: string,
): PositionedEvent[][] {
  return days.map((day) =>
    positionEventsForDay(events, day, cellHeight, timeZone),
  );
}

// ============================================================================
// SORTING UTILITIES
// ============================================================================

/**
 * Standard event sorting by start time (simple ascending)
 */
function sortEventsByStartTime(
  events: EventCollectionItem[],
  timeZone: string,
): EventCollectionItem[] {
  return [...events].sort((a, b) => {
    const aStart = getEventDates(a, timeZone).start.getTime();
    const bStart = getEventDates(b, timeZone).start.getTime();
    return aStart - bStart;
  });
}

/**
 * Collision detection (start time + duration fallback)
 * Used internally by week view positioning
 */
function sortEventsForCollisionDetection(
  events: EventCollectionItem[],
  timeZone: string,
): EventCollectionItem[] {
  return [...events].sort((a, b) => {
    const { start: aStart } = getEventDates(a, timeZone);
    const { start: bStart } = getEventDates(b, timeZone);

    if (aStart < bStart) return -1;
    if (aStart > bStart) return 1;

    const { end: aEnd } = getEventDates(a, timeZone);
    const { end: bEnd } = getEventDates(b, timeZone);
    const aDuration = differenceInMinutes(aEnd, aStart);
    const bDuration = differenceInMinutes(bEnd, bStart);
    return bDuration - aDuration;
  });
}

/**
 * Displaying multi-day events first, then by start time)
 * Used by UI components for rendering order
 */
export function sortEventsForDisplay(
  events: EventCollectionItem[],
  timeZone: string,
): EventCollectionItem[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a, timeZone);
    const bIsMultiDay = isMultiDayEvent(b, timeZone);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return (
      getEventDates(a, timeZone).start.getTime() -
      getEventDates(b, timeZone).start.getTime()
    );
  });
}

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

/**
 * Optimized event overlap checking with early termination
 */
export function batchEventOverlapCheck(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  timeZone: string,
): EventCollectionItem[] {
  const result: EventCollectionItem[] = [];

  for (const event of events) {
    // Early termination: if event starts after the day, skip remaining events
    // (assuming events are sorted by start time)
    const eventStart = event.start.toPlainDate();
    if (Temporal.PlainDate.compare(eventStart, day) > 1) {
      break;
    }

    if (eventOverlapsDay(event, day, timeZone)) {
      result.push(event);
    }
  }

  return result;
}

/**
 * Optimized sorting with memoized comparison keys
 */
export function sortEventsByStartTimeOptimized(
  events: EventCollectionItem[],
  timeZone: string,
): EventCollectionItem[] {
  if (events.length <= 1) return events;

  // Create sort keys once instead of computing them multiple times
  const sortData = events.map((event) => ({
    event,
    startTime: getEventDates(event, timeZone).start.getTime(),
  }));

  // Sort by pre-computed start times
  sortData.sort((a, b) => a.startTime - b.startTime);

  return sortData.map(({ event }) => event);
}

/**
 * Batch process multiple days with shared event filtering
 */
export function getEventCollectionsBatch(
  events: EventCollectionItem[],
  days: Temporal.PlainDate[],
  timeZone: string,
): Map<string, EventCollectionByDay> {
  if (days.length === 0 || events.length === 0) {
    return new Map();
  }

  // Sort events once for all days
  const sortedEvents = sortEventsByStartTimeOptimized(events, timeZone);
  const result = new Map<string, EventCollectionByDay>();

  // Pre-compute event date ranges for faster filtering
  const eventRanges = sortedEvents.map((event) => ({
    event,
    start: event.start.toPlainDate(),
    end: event.end.toPlainDate(),
    isAllDay: event.event.allDay,
    isMultiDay: isMultiDayEvent(event, timeZone),
  }));

  for (const day of days) {
    const dayEvents: EventCollectionItem[] = [];
    const spanningEvents: EventCollectionItem[] = [];
    const allEvents: EventCollectionItem[] = [];

    for (const { event, start, end, isMultiDay } of eventRanges) {
      // Quick overlap check using pre-computed values
      let overlaps = false;

      if (isMultiDay) {
        if (event.event.allDay) {
          const exclusiveEnd = end.subtract({ days: 1 });
          overlaps =
            Temporal.PlainDate.compare(day, start) === 0 ||
            Temporal.PlainDate.compare(day, exclusiveEnd) === 0 ||
            (Temporal.PlainDate.compare(day, start) > 0 &&
              Temporal.PlainDate.compare(day, exclusiveEnd) < 0);
        } else {
          overlaps =
            Temporal.PlainDate.compare(day, start) === 0 ||
            Temporal.PlainDate.compare(day, end) === 0 ||
            (Temporal.PlainDate.compare(day, start) > 0 &&
              Temporal.PlainDate.compare(day, end) < 0);
        }
      } else {
        overlaps = Temporal.PlainDate.compare(day, start) === 0;
      }

      if (!overlaps) continue;

      allEvents.push(event);

      if (Temporal.PlainDate.compare(day, start) === 0) {
        dayEvents.push(event);
      } else if (isMultiDay) {
        spanningEvents.push(event);
      }
    }

    result.set(day.toString(), {
      dayEvents,
      spanningEvents,
      allDayEvents: [...spanningEvents, ...dayEvents],
      allEvents,
    });
  }

  return result;
}
