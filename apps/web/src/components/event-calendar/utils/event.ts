/**
 * Event Utilities
 *
 * This file contains utility functions for:
 * - Event filtering / sorting / querying
 * - Multi-day event detection and handling
 * - Event ID generation
 */

import { isSameDay } from "date-fns";
import type { CalendarEvent } from "../types";

export function generateEventId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function isMultiDayEvent(event: CalendarEvent): boolean {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

export function getEventsForDay(
  events: CalendarEvent[],
  day: Date
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
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Only include if it's not the start day but is either the end day or a middle day
    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });
}

export function getAllEventsForDay(
  events: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return (
      isSameDay(day, eventStart) ||
      isSameDay(day, eventEnd) ||
      (day > eventStart && day < eventEnd)
    );
  });
}

export function getAgendaEventsForDay(
  events: CalendarEvent[],
  day: Date
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

export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}
