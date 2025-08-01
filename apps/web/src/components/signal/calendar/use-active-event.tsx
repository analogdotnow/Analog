"use client";

import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { toInstant } from "@repo/temporal";

import { useCalendarSettings } from "@/atoms";
import type { CalendarEvent } from "@/lib/interfaces";

interface UseActiveEventProps {
  ongoingEvent: CalendarEvent | null;
  nextEvent: CalendarEvent | null;
}

interface ActiveEventResult {
  activeEvent: CalendarEvent | null;
}

/**
 * Hook that determines which event should be considered "active" for user actions.
 *
 * Logic:
 * - If no ongoing event → uses next event
 * - If no next event → uses ongoing event
 * - If both exist → uses ongoing event unless it's ≥90% complete, then uses next event
 */
export function useActiveEvent({
  ongoingEvent,
  nextEvent,
}: UseActiveEventProps): ActiveEventResult {
  const { defaultTimeZone } = useCalendarSettings();

  const activeEvent = useMemo(() => {
    // If no ongoing event, use next event
    if (!ongoingEvent) {
      return nextEvent;
    }

    // If no next event, use ongoing event
    if (!nextEvent) {
      return ongoingEvent;
    }

    // Calculate if ongoing event is 90% over
    const now = toInstant({
      value: Temporal.Now.zonedDateTimeISO(defaultTimeZone),
      timeZone: defaultTimeZone,
    });

    const eventStart = toInstant({
      value: ongoingEvent.start,
      timeZone: defaultTimeZone,
    });

    const eventEnd = toInstant({
      value: ongoingEvent.end,
      timeZone: defaultTimeZone,
    });

    // Calculate total duration and elapsed time in nanoseconds
    const totalDuration =
      eventEnd.epochNanoseconds - eventStart.epochNanoseconds;
    const elapsedTime = now.epochNanoseconds - eventStart.epochNanoseconds;

    // If ongoing event is 90% or more complete, prefer next event
    const percentComplete = Number(elapsedTime) / Number(totalDuration);
    if (percentComplete >= 0.9) {
      return nextEvent;
    }

    // Otherwise, prefer ongoing event
    return ongoingEvent;
  }, [ongoingEvent, nextEvent, defaultTimeZone]);

  return { activeEvent };
}
