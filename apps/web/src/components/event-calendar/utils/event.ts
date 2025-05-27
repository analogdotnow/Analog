import {
  addHours,
  areIntervalsOverlapping,
  differenceInMinutes,
  getHours,
  getMinutes,
  isSameDay,
  startOfDay,
} from "date-fns";

import type { CalendarEvent } from "../types";

// ============================================================================
// CORE UTILITIES
// ============================================================================

export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

// ============================================================================
// EVENT FILTERING & QUERYING
// ============================================================================

export function filterPastEvents(
  events: CalendarEvent[],
  showPastEvents: boolean,
): CalendarEvent[] {
  if (showPastEvents) return events;

  const now = new Date();
  return events.filter((event) => new Date(event.end) >= now);
}

export function getEventsStartingOnDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(day, eventStart);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function getSpanningEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date,
): CalendarEvent[] {
  return events
    .filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        isSameDay(day, eventStart) ||
        isSameDay(day, eventEnd) ||
        (day > eventStart && day < eventEnd)
      );
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function getAllDayEventsForDays(
  events: CalendarEvent[],
  days: Date[],
): CalendarEvent[] {
  return events
    .filter((event) => event.allDay || isMultiDayEvent(event))
    .filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return days.some(
        (day) =>
          isSameDay(day, eventStart) ||
          isSameDay(day, eventEnd) ||
          (day > eventStart && day < eventEnd),
      );
    });
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
): CalendarEvent[] {
  return events.filter((event) => {
    if (event.allDay || isMultiDayEvent(event)) return false;
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (eventStart < day && eventEnd > day)
    );
  });
}

function getAdjustedEventTimes(event: CalendarEvent, day: Date) {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  const dayStart = startOfDay(day);

  return {
    start: isSameDay(day, eventStart) ? eventStart : dayStart,
    end: isSameDay(day, eventEnd) ? eventEnd : addHours(dayStart, 24),
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
): number {
  let columnIndex = 0;

  while (true) {
    const column = columns[columnIndex] || [];

    if (column.length === 0) {
      columns[columnIndex] = column;
      return columnIndex;
    }

    const hasOverlap = column.some((c) =>
      areIntervalsOverlapping(
        { start: adjustedStart, end: adjustedEnd },
        { start: new Date(c.event.start), end: new Date(c.event.end) },
      ),
    );

    if (!hasOverlap) {
      return columnIndex;
    }

    columnIndex++;
  }
}

function calculateEventLayout(columnIndex: number) {
  return {
    width: columnIndex === 0 ? 1 : 0.9,
    left: columnIndex === 0 ? 0 : columnIndex * 0.1,
    zIndex: 10 + columnIndex,
  };
}

function positionEventsForDay(
  events: CalendarEvent[],
  day: Date,
  startHour: number,
  cellHeight: number,
): PositionedEvent[] {
  const timedEvents = getTimedEventsForDay(events, day);
  const sortedEvents = sortEventsByTime(timedEvents);
  const columns: EventColumn[][] = [];
  const positioned: PositionedEvent[] = [];

  sortedEvents.forEach((event) => {
    const { start: adjustedStart, end: adjustedEnd } = getAdjustedEventTimes(
      event,
      day,
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
    );
    const { width, left, zIndex } = calculateEventLayout(columnIndex);

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
  });

  return positioned;
}

export function calculateWeekViewEventPositions(
  events: CalendarEvent[],
  days: Date[],
  startHour: number,
  cellHeight: number,
): PositionedEvent[][] {
  return days.map((day) =>
    positionEventsForDay(events, day, startHour, cellHeight),
  );
}

// ============================================================================
// SORTING UTILITIES
// ============================================================================

function sortEventsByTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aStart = new Date(a.start);
    const bStart = new Date(b.start);

    if (aStart < bStart) return -1;
    if (aStart > bStart) return 1;

    const aDuration = differenceInMinutes(new Date(a.end), aStart);
    const bDuration = differenceInMinutes(new Date(b.end), bStart);
    return bDuration - aDuration;
  });
}

export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}
