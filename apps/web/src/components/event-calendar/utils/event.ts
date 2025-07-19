import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";

import { toDate } from "@repo/temporal";

import type { CalendarEvent } from "../types";
import { AllDayCalendarEvent } from "../hooks/use-event-collection";

// ============================================================================
// CORE HELPERS
// ============================================================================

export function getEventDates(event: CalendarEvent, timeZone: string) {
  return {
    start: toDate({ value: event.start, timeZone }),
    end: toDate({ value: event.end, timeZone }),
  };
}

export function eventOverlapsDay(event: CalendarEvent, day: Date, timeZone: string): boolean {
  const { start, end } = getEventDates(event, timeZone);
  return (
    isSameDay(day, start) || isSameDay(day, end) || (day > start && day < end)
  );
}

export function isAllDayOrMultiDay(event: CalendarEvent, timeZone: string): boolean {
  return event.allDay || isMultiDayEvent(event, timeZone);
}

// ============================================================================
// CORE UTILITIES
// ============================================================================

export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function isMultiDayEvent(event: CalendarEvent, timeZone: string): boolean {
  const { start, end } = getEventDates(event, timeZone);
  return event.allDay || start.getDate() !== end.getDate();
}

// ============================================================================
// EVENT FILTERING & QUERYING
// ============================================================================

export function filterPastEvents(
  events: CalendarEvent[],
  showPastEvents: boolean,
  timeZone: string,
): CalendarEvent[] {
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
  events: CalendarEvent[],
  day: Date,
  timeZone: string,
): CalendarEvent[] {
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

export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date,
  timeZone: string,
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event, timeZone)) return false;

    const eventStart = toDate({ value: event.start, timeZone });
    const eventEnd = toDate({ value: event.end, timeZone });

    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date,
  timeZone: string,
): CalendarEvent[] {
  return sortEventsByStartTime(
    events.filter((event) => eventOverlapsDay(event, day, timeZone)),
    timeZone,
  );
}

export function getEventSpanInfoForDay(event: CalendarEvent, day: Date, timeZone: string) {
  const { start, end } = getEventDates(event, timeZone);
  return {
    eventStart: start,
    eventEnd: end,
    isFirstDay: isSameDay(day, start),
    isLastDay: isSameDay(day, end),
  };
}

/**
 * Get detailed event collections for a single day
 */
export function getEventCollectionsForDays(
  events: CalendarEvent[],
  days: [Date],
  timeZone: string,
): {
  dayEvents: CalendarEvent[];
  spanningEvents: CalendarEvent[];
  allDayEvents: CalendarEvent[];
  allEvents: CalendarEvent[];
};

/**
 * Get aggregated all-day events for multiple days
 */
export function getEventCollectionsForDays(
  events: CalendarEvent[],
  days: Date[],
  timeZone: string,
): AllDayCalendarEvent[];

/**
 * Get event collections for multiple days (pass single day as [day] for single-day use)
 */
export function getEventCollectionsForDays(
  events: CalendarEvent[],
  days: Date[],
  timeZone: string,
) {
  if (days.length === 0) {
    return [];
  }
  if (days.length > 1) {
    const allDayEvents = events
      .filter((event) => isAllDayOrMultiDay(event, timeZone))
      .filter((event) => days.some((day) => eventOverlapsDay(event, day, timeZone)));

    return sortEventsByStartTime(allDayEvents, timeZone);
  }

  const day = days[0]!;
  const dayEvents: CalendarEvent[] = [];
  const spanningEvents: CalendarEvent[] = [];
  const allEvents: CalendarEvent[] = [];

  events.forEach((event) => {
    if (!eventOverlapsDay(event, day, timeZone)) return;

    allEvents.push(event);
    const { start } = getEventDates(event, timeZone);

    if (isSameDay(day, start)) {
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

// ============================================================================
// WEEK VIEW POSITIONING
// ============================================================================

export interface PositionedEvent {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

interface EventColumn {
  event: CalendarEvent;
  end: Date;
}

function getTimedEventsForDay(
  events: CalendarEvent[],
  day: Date,
  timeZone: string,
): CalendarEvent[] {
  return events.filter((event) => {
    if (isAllDayOrMultiDay(event, timeZone)) return false;
    return eventOverlapsDay(event, day, timeZone);
  });
}

function getAdjustedEventTimes(event: CalendarEvent, day: Date, timeZone: string) {
  const { start, end } = getEventDates(event, timeZone);
  const dayStart = startOfDay(day);

  return {
    start: isSameDay(day, start) ? start : dayStart,
    end: isSameDay(day, end) ? end : addHours(dayStart, 24),
  };
}

function calculateEventDimensions(
  adjustedStart: Date,
  adjustedEnd: Date,
  startHour: number,
  cellHeight: number,
) {
  const startHourValue =
    getHours(adjustedStart) + getMinutes(adjustedStart) / 60;
  const endHourValue = getHours(adjustedEnd) + getMinutes(adjustedEnd) / 60;

  return {
    top: (startHourValue - startHour) * cellHeight,
    height: (endHourValue - startHourValue) * cellHeight,
  };
}

function findEventColumn(
  event: CalendarEvent,
  adjustedStart: Date,
  adjustedEnd: Date,
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
      const { start, end } = getEventDates(c.event, timeZone);
      return areIntervalsOverlapping(
        { start: adjustedStart, end: adjustedEnd },
        { start, end },
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
  events: CalendarEvent[],
  day: Date,
  startHour: number,
  cellHeight: number,
  timeZone: string,
): PositionedEvent[] {
  const timedEvents = getTimedEventsForDay(events, day, timeZone);
  const sortedEvents = sortEventsForCollisionDetection(timedEvents, timeZone);
  const positioned: PositionedEvent[] = [];

  // Group events that start within 24px of each other
  const proximityThresholdHours = 40 / cellHeight;
  const eventGroups: CalendarEvent[][] = [];

  for (const event of sortedEvents) {
    const { start } = getAdjustedEventTimes(event, day, timeZone);
    const startHourValue = getHours(start) + getMinutes(start) / 60;

    // Find existing group within proximity threshold
    let assignedGroup = false;
    for (const group of eventGroups) {
      if (group.length > 0) {
        const { start: groupStart, end: groupEnd } = getAdjustedEventTimes(
          group[0]!,
          day,
          timeZone,
        );
        const groupStartHourValue =
          getHours(groupStart) + getMinutes(groupStart) / 60;

        const groupEndTime = getHours(groupEnd) + getMinutes(groupEnd) / 60;

        if (
          Math.abs(startHourValue - groupStartHourValue) <=
            proximityThresholdHours &&
          startHourValue < groupEndTime // Only add if event starts before group ends
        ) {
          group.push(event);
          assignedGroup = true;
          break;
        }
      }
    }

    if (!assignedGroup) {
      eventGroups.push([event]);
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
          const { start: groupStart, end: groupEnd } =
            getEventDates(groupEvent, timeZone);
          return previousGroup.some((previousEvent) => {
            const { start: previousStart, end: previousEnd } =
              getEventDates(previousEvent, timeZone);
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
          const { start: groupStart, end: groupEnd } =
            getEventDates(groupEvent, timeZone);
          return previousGroup.some((previousEvent) => {
            const { start: previousStart, end: previousEnd } =
              getEventDates(previousEvent, timeZone);
            return areIntervalsOverlapping(
              { start: groupStart, end: groupEnd },
              { start: previousStart, end: previousEnd },
            );
          });
        });
      }).length;

    const baseZIndex = groupZLayers[groupIdx]!;

    for (const [groupIndex, event] of group.entries()) {
      const { start: adjustedStart, end: adjustedEnd } = getAdjustedEventTimes(
        event,
        day,
        timeZone,
      );
      const { top, height } = calculateEventDimensions(
        adjustedStart,
        adjustedEnd,
        startHour,
        cellHeight,
      );

      const columnIndex = findEventColumn(
        event,
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
      column.push({ event, end: adjustedEnd });

      positioned.push({
        event,
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
  events: CalendarEvent[],
  days: Date[],
  startHour: number,
  cellHeight: number,
  timeZone: string,
): PositionedEvent[][] {
  return days.map((day) =>
    positionEventsForDay(events, day, startHour, cellHeight, timeZone),
  );
}

// ============================================================================
// SORTING UTILITIES
// ============================================================================

/**
 * Standard event sorting by start time (simple ascending)
 */
function sortEventsByStartTime(events: CalendarEvent[], timeZone: string): CalendarEvent[] {
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
  events: CalendarEvent[],
  timeZone: string,
): CalendarEvent[] {
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
export function sortEventsForDisplay(events: CalendarEvent[], timeZone: string): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a, timeZone);
    const bIsMultiDay = isMultiDayEvent(b, timeZone);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return getEventDates(a, timeZone).start.getTime() - getEventDates(b, timeZone).start.getTime();
  });
}
