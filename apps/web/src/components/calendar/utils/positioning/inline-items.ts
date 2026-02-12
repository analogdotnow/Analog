import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, isSameDay } from "@repo/temporal";

import { DisplayItem, InlineDisplayItem, isAllDay } from "@/lib/display-item";
import { clampToEndOfDay, clampToStartOfDay } from "./utils";

const PROXIMITY_THRESHOLD = 40;

export function displayItemOverlapsDay(
  item: DisplayItem,
  day: Temporal.PlainDate,
) {
  const { start, end } = item.date;

  return (
    isSameDay(day, start) ||
    isSameDay(day, end) ||
    (isAfter(day, start) && isBefore(day, end))
  );
}

export function isAllDayOrMultiDay(item: InlineDisplayItem) {
  return isAllDay(item) || isMultiDayItem(item);
}

export function isMultiDayItem(item: InlineDisplayItem) {
  return !isSameDay(item.start, item.end);
}

/**
 * Get display item collections for a day
 */
export function getDisplayItemCollectionsForDay(
  items: InlineDisplayItem[],
  day: Temporal.PlainDate,
) {
  const dayItems: InlineDisplayItem[] = [];
  const spanningItems: InlineDisplayItem[] = [];
  const allItems: InlineDisplayItem[] = [];

  for (const item of items) {
    if (!displayItemOverlapsDay(item, day)) {
      continue;
    }

    allItems.push(item);

    if (isSameDay(day, item.date.start)) {
      dayItems.push(item);
    } else if (isAllDay(item) || isMultiDayItem(item)) {
      spanningItems.push(item);
    }
  }

  return {
    dayItems,
    spanningItems,
    allDayItems: [...spanningItems, ...dayItems],
    allItems,
  };
}

function isOverlappingWithRange(
  item: InlineDisplayItem,
  days: Temporal.PlainDate[],
) {
  return days.some((day) => displayItemOverlapsDay(item, day));
}

/**
 * Get aggregated all-day items for multiple days
 */
export function getAllDayItemCollectionsForDays(
  items: InlineDisplayItem[],
  days: Temporal.PlainDate[],
) {
  if (days.length === 0) {
    return [];
  }

  return items.filter(
    (item) => isAllDayOrMultiDay(item) && isOverlappingWithRange(item, days),
  );
}

export interface DisplayItemPosition {
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
}

export interface PositionedDisplayItem {
  item: InlineDisplayItem;
  position: DisplayItemPosition;
}

function getTimedItemsForDay(
  items: InlineDisplayItem[],
  day: Temporal.PlainDate,
): InlineDisplayItem[] {
  return items.filter((item) => {
    if (isAllDayOrMultiDay(item)) {
      return false;
    }

    return displayItemOverlapsDay(item, day);
  });
}

function calculateItemDimensions(
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
  items: InlineDisplayItem[];
  startMinutes: number;
  endMinutes: number;
}

interface GroupItemsByProximityOptions {
  sortedItems: InlineDisplayItem[];
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

  const start = clampToStartOfDay(lastGroup.items.at(-1)!.start, day);

  const startsWithinProximity =
    startMinutes - (start.hour * 60 + start.minute) <= thresholdMinutes;
  const startsBeforeGroupEnds = startMinutes < lastGroup.endMinutes;

  return startsWithinProximity && startsBeforeGroupEnds;
}

function groupItemsByProximity({
  sortedItems,
  day,
  cellHeight,
}: GroupItemsByProximityOptions) {
  if (sortedItems.length === 0) {
    return [];
  }

  const groups: ProximityGroup[] = [];

  for (const item of sortedItems) {
    const start = clampToStartOfDay(item.start, day);
    const end = clampToEndOfDay(item.end, day);
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
      lastGroup.items.push(item);
      lastGroup.endMinutes = Math.max(lastGroup.endMinutes, endMinutes);

      continue;
    }

    groups.push({
      items: [item],
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
  const { top, height } = calculateItemDimensions(start, end, 0, cellHeight);

  const offsetPercentage = Math.min(overlapDepth * 0.1, 0.5);
  const availableWidth = 1 - offsetPercentage;

  const width = availableWidth / columns;
  const left = offsetPercentage + index * width;

  const zIndex = 10 + overlapDepth * 10 + index;

  return { top, height, left, width, zIndex };
}

function positionItemsForDay(
  items: InlineDisplayItem[],
  day: Temporal.PlainDate,
  cellHeight: number,
) {
  const timedItems = getTimedItemsForDay(items, day);
  const sortedItems = sortItemsForCollisionDetection(timedItems);

  if (sortedItems.length === 0) {
    return [];
  }

  const groups = groupItemsByProximity({
    sortedItems,
    day,
    cellHeight,
  });

  const positioned: PositionedDisplayItem[] = [];
  const activeGroupEnds: number[] = [];

  for (const group of groups) {
    while (isActiveGroupEnded(activeGroupEnds, group.startMinutes)) {
      activeGroupEnds.shift();
    }

    for (const [index, item] of group.items.entries()) {
      const start = clampToStartOfDay(item.start, day);
      const end = clampToEndOfDay(item.end, day);

      const position = calculatePosition({
        start,
        end,
        index,
        overlapDepth: activeGroupEnds.length,
        columns: group.items.length,
        cellHeight,
      });

      positioned.push({ item, position });
    }

    const insertIdx = findInsertIndex(activeGroupEnds, group.endMinutes);

    activeGroupEnds.splice(insertIdx, 0, group.endMinutes);
  }

  return positioned;
}

interface CalculateWeekViewPositionsOptions {
  items: InlineDisplayItem[];
  days: Temporal.PlainDate[];
  cellHeight: number;
}

export function calculateWeekViewDisplayItemPositions({
  items,
  days,
  cellHeight,
}: CalculateWeekViewPositionsOptions) {
  return days.map((day) => positionItemsForDay(items, day, cellHeight));
}

function sortItemsForCollisionDetection(items: InlineDisplayItem[]) {
  return [...items].sort((a, b) => {
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
