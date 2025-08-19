"use client";

import { useMemo } from "react";

import { isAfter, isBefore } from "@repo/temporal";

import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";

interface NextEventResult {
  nextEvent: EventCollectionItem | null;
  ongoingEvent: EventCollectionItem | null;
}

interface UseNextEventProps {
  events: EventCollectionItem[];
}

export function useUpcomingEvent({
  events,
}: UseNextEventProps): NextEventResult {
  const currentTime = useZonedDateTime();

  return useMemo(() => {
    if (!events || events.length === 0) {
      return {
        nextEvent: null,
        ongoingEvent: null,
      };
    }

    // Find ongoing events (current time is between start and end)
    const ongoingEvents = events.filter(
      (event) =>
        isAfter(currentTime, event.start) && isBefore(currentTime, event.end),
    );

    // Find future events (start time is after current time)
    const futureEvents = events.filter((event) =>
      isAfter(event.start, currentTime),
    );

    // Get the most recently started ongoing event
    const ongoingEvent =
      ongoingEvents.length > 0
        ? ongoingEvents.reduce((latest, current) =>
            isAfter(current.start, latest.start) ? current : latest,
          )
        : null;

    // Get the earliest upcoming event
    const nextEvent =
      futureEvents.length > 0
        ? futureEvents.reduce((earliest, current) =>
            isBefore(current.start, earliest.start) ? current : earliest,
          )
        : null;

    return {
      nextEvent,
      ongoingEvent,
    };
  }, [events, currentTime]);
}
