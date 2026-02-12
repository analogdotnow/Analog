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

export type AllDayEventDisplayItem = EventDisplayItem & {
  event: { allDay: true; start: Temporal.PlainDate; end: Temporal.PlainDate };
};

export type AllDayTaskDisplayItem = TaskDisplayItem & {
  value: { allDay: true };
};

export type AllDayDisplayItem = AllDayEventDisplayItem | AllDayTaskDisplayItem;

export type TimedEventDisplayItem = EventDisplayItem & {
  event: {
    allDay?: false;
    start: Temporal.Instant | Temporal.ZonedDateTime;
    end: Temporal.Instant | Temporal.ZonedDateTime;
  };
};

export type InstantEventDisplayItem = EventDisplayItem & {
  event: CalendarEvent<Temporal.Instant>;
};

export type ZonedEventDisplayItem = EventDisplayItem & {
  event: CalendarEvent<Temporal.ZonedDateTime>;
};

export type TimedTaskDisplayItem = TaskDisplayItem & {
  value: { allDay: false };
};

export type TimedDisplayItem = TimedEventDisplayItem | TimedTaskDisplayItem;

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
  date: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
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
  date: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

export interface LocationDisplayItem {
  id: string;
  type: "location";
  display: "background";
  value: object;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  date: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

export type JourneyMode =
  | "driving"
  | "transit"
  | "walking"
  | "cycling"
  | "flight"
  | "train"
  | "ferry";

export interface JourneyValue {
  from: string;
  to: string;
  mode?: JourneyMode;
}

export interface JourneyDisplayItem {
  id: string;
  type: "journey";
  display: "side";
  value: JourneyValue;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  date: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
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

export function isInstantEvent(
  item: EventDisplayItem,
): item is InstantEventDisplayItem {
  return item.event.start instanceof Temporal.Instant;
}

export function isZonedEvent(
  item: EventDisplayItem,
): item is ZonedEventDisplayItem {
  return item.event.start instanceof Temporal.ZonedDateTime;
}

export function isAllDay(
  item: EventDisplayItem,
): item is AllDayEventDisplayItem;
export function isAllDay(item: TaskDisplayItem): item is AllDayTaskDisplayItem;
export function isAllDay(item: DisplayItem): item is AllDayDisplayItem;
export function isAllDay(item: DisplayItem): item is AllDayDisplayItem {
  if (isEvent(item)) {
    return item.event.allDay ?? false;
  }

  if (isTask(item)) {
    return item.value.allDay;
  }

  return false;
}

export function isTimed(item: EventDisplayItem): item is TimedEventDisplayItem;
export function isTimed(item: TaskDisplayItem): item is TimedTaskDisplayItem;
export function isTimed(item: DisplayItem): item is TimedDisplayItem;
export function isTimed(item: DisplayItem): item is TimedDisplayItem {
  return !isAllDay(item) && isInlineItem(item);
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
    date: {
      start: start.toPlainDate(),
      end: end.toPlainDate(),
    },
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
    date: {
      start: start.toPlainDate(),
      end: end.toPlainDate(),
    },
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
    date: {
      start: start.toPlainDate(),
      end: end.toPlainDate(),
    },
  };
}

export function createJourneyDisplayItem(
  journeyId: string,
  value: JourneyValue,
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
    date: {
      start: start.toPlainDate(),
      end: end.toPlainDate(),
    },
  };
}
