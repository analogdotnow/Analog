"use client";

import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { compareTemporal, toInstant } from "@repo/temporal";

import { useCalendarSettings } from "@/atoms";
import { useZonedDateTime } from "@/components/event-calendar/context/datetime-provider";
import type { CalendarEvent } from "@/lib/interfaces";

interface NextEventResult {
  nextEvent: CalendarEvent | null;
  ongoingEvent: CalendarEvent | null;
}

interface UseNextEventProps {
  events: CalendarEvent[];
}

export function useNextEvent({ events }: UseNextEventProps): NextEventResult {
  const currentTime = useZonedDateTime();
  const { defaultTimeZone } = useCalendarSettings();

  return useMemo(() => {
    if (!events || events.length === 0) {
      return {
        nextEvent: null,
        ongoingEvent: null,
      };
    }

    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) =>
      compareTemporal(a.start, b.start),
    );

    let nextEvent: CalendarEvent | null = null;
    let ongoingEvent: CalendarEvent | null = null;

    const now = toInstant({ value: currentTime, timeZone: defaultTimeZone });

    // Find the next upcoming event and any ongoing event
    for (const event of sortedEvents) {
      const eventStart = toInstant({
        value: event.start,
        timeZone: defaultTimeZone,
      });
      const eventEnd = toInstant({
        value: event.end,
        timeZone: defaultTimeZone,
      });

      // Check if event is currently ongoing
      if (
        Temporal.Instant.compare(now, eventStart) >= 0 &&
        Temporal.Instant.compare(now, eventEnd) < 0
      ) {
        // If there's already an ongoing event, pick the one that started more recently
        if (
          !ongoingEvent ||
          compareTemporal(event.start, ongoingEvent.start) > 0
        ) {
          ongoingEvent = event;
        }
      }

      // Check if event is in the future
      if (Temporal.Instant.compare(eventStart, now) > 0) {
        // If we haven't found a next event yet, this is it
        if (!nextEvent) {
          nextEvent = event;
        }
        // If the next event is closer than the start of the previous event, use it
        else {
          const currentNextStart = toInstant({
            value: nextEvent.start,
            timeZone: defaultTimeZone,
          });
          if (Temporal.Instant.compare(eventStart, currentNextStart) < 0) {
            nextEvent = event;
          }
        }
      }
    }

    return {
      nextEvent,
      ongoingEvent,
    };
  }, [events, currentTime, defaultTimeZone]);
}
