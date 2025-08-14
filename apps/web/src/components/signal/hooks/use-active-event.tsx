"use client";

import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";

interface UseActiveEventProps {
  ongoingEvent: EventCollectionItem | null;
  nextEvent: EventCollectionItem | null;
}

interface ActiveEventResult {
  activeEvent: EventCollectionItem | null;
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
  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

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
    const now = Temporal.Now.zonedDateTimeISO(defaultTimeZone);

    // Calculate total duration and elapsed time in nanoseconds
    const duration = ongoingEvent.start.until(ongoingEvent.end);
    const elapsedTime = now.since(ongoingEvent.start);

    // If ongoing event is 90% or more complete, prefer next event
    const percentComplete =
      elapsedTime.total({ unit: "minute" }) /
      duration.total({ unit: "minute" });

    if (percentComplete >= 0.9) {
      return nextEvent;
    }

    // Otherwise, prefer ongoing event
    return ongoingEvent;
  }, [ongoingEvent, nextEvent, defaultTimeZone]);

  return { activeEvent };
}
