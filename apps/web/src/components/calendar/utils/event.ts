import { areIntervalsOverlapping } from "interval-temporal";
import { Temporal } from "temporal-polyfill";

import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "@repo/temporal";

import { EventCollectionItem } from "../hooks/event-collection";

// ============================================================================
// CORE HELPERS
// ============================================================================

export function eventOverlapsDay(
  item: EventCollectionItem,
  day: Temporal.PlainDate,
): boolean {
  const start = item.start.toPlainDate();
  const end = item.end.toPlainDate();

  // For all-day events, the end date is exclusive, so we should not include it in the overlap check
  if (item.event.allDay) {
    const exclusiveEnd = end.subtract({ days: 1 });

    return (
      isSameDay(day, start) ||
      isSameDay(day, exclusiveEnd) ||
      (isAfter(day, start) && isBefore(day, exclusiveEnd))
    );
  }

  // For timed events, include the end day
  return (
    isSameDay(day, start) ||
    isSameDay(day, end) ||
    (isAfter(day, start) && isBefore(day, end))
  );
}

export function isAllDayOrMultiDay(item: EventCollectionItem): boolean {
  return item.event.allDay || isMultiDayEvent(item);
}

function isMultiDayEvent(item: EventCollectionItem): boolean {
  return item.event.allDay || !isSameDay(item.start, item.end);
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

  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  return events.filter((event) => isAfter(event.end, now));
}

export function getEventsStartingOnPlainDate(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
): EventCollectionItem[] {
  return events.filter((event) => {
    const eventStart = event.start.toPlainDate();
    return isSameDay(eventStart, day);
  });
}

/**
 * Get event collections for multiple days (pass single day as [day] for single-day use)
 */
export function getEventCollectionsForDay(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
) {
  const dayEvents: EventCollectionItem[] = [];
  const spanningEvents: EventCollectionItem[] = [];
  const allEvents: EventCollectionItem[] = [];

  events.forEach((event) => {
    if (!eventOverlapsDay(event, day)) return;

    allEvents.push(event);
    const start = event.start.toPlainDate();

    if (isSameDay(day, start)) {
      dayEvents.push(event);
    } else if (isMultiDayEvent(event)) {
      spanningEvents.push(event);
    }
  });

  return {
    dayEvents,
    spanningEvents,
    allDayEvents: [...spanningEvents, ...dayEvents],
    allEvents,
  };
}

/**
 * Get aggregated all-day events for multiple days
 */
export function getAllDayEventCollectionsForDays(
  events: EventCollectionItem[],
  days: Temporal.PlainDate[],
) {
  if (days.length === 0) {
    return [];
  }

  const allDayEvents = events
    .filter((event) => isAllDayOrMultiDay(event))
    .filter((event) => days.some((day) => eventOverlapsDay(event, day)));

  return allDayEvents;
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
): EventCollectionItem[] {
  return events.filter((event) => {
    if (isAllDayOrMultiDay(event)) {
      return false;
    }

    return eventOverlapsDay(event, day);
  });
}

function getAdjustedEventTimes(
  item: EventCollectionItem,
  day: Temporal.PlainDate,
  timeZone: string,
) {
  return {
    start: isSameDay(day, item.start, { timeZone })
      ? item.start
      : startOfDay(day, { timeZone }),
    end: isSameDay(day, item.end, { timeZone })
      ? item.end
      : endOfDay(day, { timeZone }),
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
): number {
  let columnIndex = 0;

  while (true) {
    const column = columns[columnIndex] || [];

    if (column.length === 0) {
      columns[columnIndex] = column;
      return columnIndex;
    }

    const hasOverlap = column.some((c) => {
      return areIntervalsOverlapping(
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
  const timedEvents = getTimedEventsForDay(events, day);
  const sortedEvents = sortEventsForCollisionDetection(timedEvents);
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
          return previousGroup.some((previousEvent) => {
            return areIntervalsOverlapping(
              { start: groupEvent.start, end: groupEvent.end },
              { start: previousEvent.start, end: previousEvent.end },
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
          return previousGroup.some((previousEvent) => {
            return areIntervalsOverlapping(
              { start: groupEvent.start, end: groupEvent.end },
              { start: previousEvent.start, end: previousEvent.end },
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
 * Collision detection (start time + duration fallback)
 * Used internally by week view positioning
 */
function sortEventsForCollisionDetection(
  events: EventCollectionItem[],
): EventCollectionItem[] {
  return [...events].sort((a, b) => {
    const aStart = a.start;
    const bStart = b.start;

    if (isBefore(aStart, bStart)) return -1;
    if (isAfter(aStart, bStart)) return 1;

    const aEnd = a.end;
    const bEnd = b.end;
    const aDuration = aEnd.epochMilliseconds - aStart.epochMilliseconds;
    const bDuration = bEnd.epochMilliseconds - bStart.epochMilliseconds;
    return bDuration - aDuration;
  });
}
