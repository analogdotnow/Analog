import { Temporal } from "temporal-polyfill";

import { isAfter, isSameDay, toZonedDateTime } from "@repo/temporal";

import type { CalendarEvent } from "@/lib/interfaces";

function getInclusiveEnd(event: CalendarEvent, timeZone: string) {
  const start = toZonedDateTime(event.start, { timeZone });
  const endExclusive = toZonedDateTime(event.end, { timeZone });

  if (!event.allDay) {
    if (isAfter(endExclusive, start)) {
      return { start, end: endExclusive.subtract({ seconds: 1 }) };
    }

    return { start, end: start };
  }

  const end = isSameDay(start, endExclusive)
    ? start.add({ days: 1 })
    : endExclusive;

  return { start, end: end.subtract({ seconds: 1 }) };
}

export type DisplayItem =
  | EventDisplayItem
  | TaskDisplayItem
  | LocationDisplayItem
  | JourneyDisplayItem;

export type InlineDisplayItem = EventDisplayItem | TaskDisplayItem;
export type BackgroundDisplayItem = LocationDisplayItem;
export type SideDisplayItem = JourneyDisplayItem;

export interface EventDisplayItem {
  id: string;
  type: "event";
  display: "inline";
  event: CalendarEvent;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
}

export interface TaskDisplayItem {
  id: string;
  type: "task";
  display: "inline";
  value: {
    title: string;
    allDay: boolean;
  };
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
}

export interface LocationDisplayItem {
  id: string;
  type: "location";
  display: "background";
  value: object;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
}

export interface JourneyDisplayItem {
  id: string;
  type: "journey";
  display: "side";
  value: object;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
}

export function isEvent(item: DisplayItem): item is EventDisplayItem {
  return item.type === "event";
}

export function isTask(item: DisplayItem): item is TaskDisplayItem {
  return item.type === "task";
}

export function isLocation(item: DisplayItem): item is LocationDisplayItem {
  return item.type === "location";
}

export function isJourney(item: DisplayItem): item is JourneyDisplayItem {
  return item.type === "journey";
}

export function isInlineItem(
  item: DisplayItem,
): item is EventDisplayItem | TaskDisplayItem {
  return item.display === "inline";
}

export function isBackgroundItem(
  item: DisplayItem,
): item is LocationDisplayItem {
  return item.display === "background";
}

export function isSideItem(item: DisplayItem): item is JourneyDisplayItem {
  return item.display === "side";
}

export function isAllDay(item: DisplayItem): boolean {
  if (isEvent(item)) {
    return item.event.allDay ?? false;
  }

  if (isTask(item)) {
    return item.value.allDay;
  }

  return false;
}

export function createEventDisplayItem(
  event: CalendarEvent,
  timeZone: string,
): EventDisplayItem {
  const { start, end } = getInclusiveEnd(event, timeZone);

  return {
    id: `event_${event.id}`,
    type: "event",
    display: "inline",
    event,
    start,
    end,
  };
}

export function createTaskDisplayItem(
  taskId: string,
  title: string,
  allDay: boolean,
  start: Temporal.ZonedDateTime,
  end: Temporal.ZonedDateTime,
): TaskDisplayItem {
  return {
    id: `task_${taskId}`,
    type: "task",
    display: "inline",
    value: { title, allDay },
    start,
    end,
  };
}

export function createLocationDisplayItem(
  locationId: string,
  value: object,
  start: Temporal.ZonedDateTime,
  end: Temporal.ZonedDateTime,
): LocationDisplayItem {
  return {
    id: `location_${locationId}`,
    type: "location",
    display: "background",
    value,
    start,
    end,
  };
}

export function createJourneyDisplayItem(
  journeyId: string,
  value: object,
  start: Temporal.ZonedDateTime,
  end: Temporal.ZonedDateTime,
): JourneyDisplayItem {
  return {
    id: `journey_${journeyId}`,
    type: "journey",
    display: "side",
    value,
    start,
    end,
  };
}
