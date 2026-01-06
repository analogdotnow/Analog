import { Temporal } from "temporal-polyfill";

import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "@repo/temporal";

import { EventCollectionItem } from "../hooks/event-collection";

const PROXIMITY_THRESHOLD = 40;

export function eventOverlapsDay(
  item: EventCollectionItem,
  day: Temporal.PlainDate,
) {
  const start = item.start.toPlainDate();
  const end = item.end.toPlainDate();

  return (
    isSameDay(day, start) ||
    isSameDay(day, end) ||
    (isAfter(day, start) && isBefore(day, end))
  );
}

export function isAllDayOrMultiDay(item: EventCollectionItem) {
  return item.event.allDay || isMultiDayEvent(item);
}

function isMultiDayEvent(item: EventCollectionItem) {
  return item.event.allDay || !isSameDay(item.start, item.end);
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

  for (const event of events) {
    if (!eventOverlapsDay(event, day)) {
      continue;
    }

    allEvents.push(event);

    const start = event.start.toPlainDate();

    if (isSameDay(day, start)) {
      dayEvents.push(event);
    } else if (isMultiDayEvent(event)) {
      spanningEvents.push(event);
    }
  }

  return {
    dayEvents,
    spanningEvents,
    allDayEvents: [...spanningEvents, ...dayEvents],
    allEvents,
  };
}

function isOverlappingWithRange(
  event: EventCollectionItem,
  days: Temporal.PlainDate[],
) {
  return days.some((day) => eventOverlapsDay(event, day));
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

  const allDayEvents = events.filter(
    (event) => isAllDayOrMultiDay(event) && isOverlappingWithRange(event, days),
  );

  return allDayEvents;
}

export interface PositionedEvent {
  item: EventCollectionItem;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
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

function clampToStartOfDay(item: EventCollectionItem, day: Temporal.PlainDate) {
  if (isSameDay(day, item.start, { timeZone: item.start.timeZoneId })) {
    return item.start;
  }

  return startOfDay(day, { timeZone: item.start.timeZoneId });
}

function clampToEndOfDay(item: EventCollectionItem, day: Temporal.PlainDate) {
  if (isSameDay(day, item.end, { timeZone: item.end.timeZoneId })) {
    return item.end;
  }

  return endOfDay(day, { timeZone: item.end.timeZoneId });
}

function calculateEventDimensions(
  start: Temporal.ZonedDateTime,
  end: Temporal.ZonedDateTime,
  startHour: number,
  cellHeight: number,
) {
  const startHourValue = start.hour + start.minute / 60;
  const endHourValue = end.hour + end.minute / 60;

  return {
    top: (startHourValue - startHour) * cellHeight,
    height: (endHourValue - startHourValue) * cellHeight,
  };
}

interface ProximityGroup {
  events: EventCollectionItem[];
  startMinutes: number;
  endMinutes: number;
}

interface GroupEventsByProximityOptions {
  sortedEvents: EventCollectionItem[];
  day: Temporal.PlainDate;
  cellHeight: number;
}

interface IsWithinProximityOptions {
  startMinutes: number;
  lastGroup: ProximityGroup;
  cellHeight: number;
  day: Temporal.PlainDate;
}

function isWithinProximity({
  startMinutes,
  lastGroup,
  cellHeight,
  day,
}: IsWithinProximityOptions) {
  const thresholdMinutes = (PROXIMITY_THRESHOLD / cellHeight) * 60;

  const start = clampToStartOfDay(lastGroup.events.at(-1)!, day);

  const startsWithinProximity =
    startMinutes - (start.hour * 60 + start.minute) <= thresholdMinutes;
  const startsBeforeGroupEnds = startMinutes < lastGroup.endMinutes;

  return startsWithinProximity && startsBeforeGroupEnds;
}

function groupEventsByProximity({
  sortedEvents,
  day,
  cellHeight,
}: GroupEventsByProximityOptions) {
  if (sortedEvents.length === 0) {
    return [];
  }

  const groups: ProximityGroup[] = [];

  for (const event of sortedEvents) {
    const start = clampToStartOfDay(event, day);
    const end = clampToEndOfDay(event, day);
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;

    const lastGroup = groups.at(-1);

    if (
      lastGroup &&
      isWithinProximity({
        startMinutes,
        lastGroup,
        cellHeight,
        day,
      })
    ) {
      lastGroup.events.push(event);
      lastGroup.endMinutes = Math.max(lastGroup.endMinutes, endMinutes);

      continue;
    }

    groups.push({
      events: [event],
      startMinutes,
      endMinutes,
    });
  }

  return groups;
}

function isActiveGroupEnded(activeGroupEnds: number[], startMinutes: number) {
  return activeGroupEnds.length > 0 && activeGroupEnds[0]! <= startMinutes;
}

function findInsertIndex(groupEnds: number[], endMinutes: number) {
  const insertIdx = groupEnds.findIndex(
    (activeGroupEnd) => activeGroupEnd > endMinutes,
  );

  if (insertIdx === -1) {
    return groupEnds.length;
  }

  return insertIdx;
}

interface CalculatePositionOptions {
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  index: number;
  overlapDepth: number;
  columns: number;
  cellHeight: number;
}

function calculatePosition({
  start,
  end,
  index,
  overlapDepth,
  columns,
  cellHeight,
}: CalculatePositionOptions) {
  const { top, height } = calculateEventDimensions(start, end, 0, cellHeight);

  const offsetPercentage = Math.min(overlapDepth * 0.1, 0.5);
  const availableWidth = 1 - offsetPercentage;

  const width = availableWidth / columns;
  const left = offsetPercentage + index * width;

  const zIndex = 10 + overlapDepth * 10 + index;

  return { top, height, left, width, zIndex };
}

function positionEventsForDay(
  events: EventCollectionItem[],
  day: Temporal.PlainDate,
  cellHeight: number,
) {
  const timedEvents = getTimedEventsForDay(events, day);
  const sortedEvents = sortEventsForCollisionDetection(timedEvents);

  if (sortedEvents.length === 0) {
    return [];
  }

  const groups = groupEventsByProximity({
    sortedEvents,
    day,
    cellHeight,
  });

  const positioned: PositionedEvent[] = [];
  const activeGroupEnds: number[] = [];

  for (const group of groups) {
    while (isActiveGroupEnded(activeGroupEnds, group.startMinutes)) {
      activeGroupEnds.shift();
    }

    for (const [index, item] of group.events.entries()) {
      const start = clampToStartOfDay(item, day);
      const end = clampToEndOfDay(item, day);

      const position = calculatePosition({
        start,
        end,
        index,
        overlapDepth: activeGroupEnds.length,
        columns: group.events.length,
        cellHeight,
      });

      positioned.push({ item, ...position });
    }

    const insertIdx = findInsertIndex(activeGroupEnds, group.endMinutes);

    activeGroupEnds.splice(insertIdx, 0, group.endMinutes);
  }

  return positioned;
}

interface CalculateWeekViewEventPositionsOptions {
  events: EventCollectionItem[];
  days: Temporal.PlainDate[];
  cellHeight: number;
}

export function calculateWeekViewEventPositions({
  events,
  days,
  cellHeight,
}: CalculateWeekViewEventPositionsOptions) {
  return days.map((day) => positionEventsForDay(events, day, cellHeight));
}

function sortEventsForCollisionDetection(events: EventCollectionItem[]) {
  return [...events].sort((a, b) => {
    if (isBefore(a.start, b.start)) {
      return -1;
    }

    if (isAfter(a.start, b.start)) {
      return 1;
    }

    const aDuration = a.end.epochMilliseconds - a.start.epochMilliseconds;
    const bDuration = b.end.epochMilliseconds - b.start.epochMilliseconds;

    return bDuration - aDuration;
  });
}
