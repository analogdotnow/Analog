import * as React from "react";

import { EventCollectionItem } from "@/components/event-calendar/hooks/event-collection";
import { EventGap, EventHeight } from "../constants";
import {
  getOverflowEvents,
  organizeEventsWithOverflow,
  type EventCapacityInfo,
} from "../utils/multi-day-layout";

interface UseMultiDayOverflowOptions {
  events: EventCollectionItem[];
  timeZone: string;
  eventHeight?: number;
  eventGap?: number;
  minVisibleLanes?: number;
}

interface UseMultiDayOverflowResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  availableHeight: number;
  capacityInfo: EventCapacityInfo;
  visibleEvents: EventCollectionItem[];
  overflowEvents: EventCollectionItem[];
  hasOverflow: boolean;
  overflowCount: number;
}

export function useMultiDayOverflow({
  events,
  timeZone,
  eventHeight = EventHeight,
  eventGap = EventGap,
  minVisibleLanes,
}: UseMultiDayOverflowOptions): UseMultiDayOverflowResult {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const [availableHeight, setAvailableHeight] = React.useState<number>(0);

  // Measure available height
  const measureHeight = React.useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    setAvailableHeight(rect.height);
  }, []);

  // Set up ResizeObserver to track container height changes
  React.useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }

    measureHeight();

    if (!observerRef.current) {
      observerRef.current = new ResizeObserver(() => {
        measureHeight();
      });
    }

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [measureHeight]);

  // Calculate capacity and organize events
  const capacityInfo = React.useMemo(
    () =>
      organizeEventsWithOverflow(
        events,
        minVisibleLanes
          ? Math.max(
              minVisibleLanes * (eventHeight + eventGap),
              availableHeight,
            )
          : availableHeight,
        timeZone,
        eventHeight,
        eventGap,
      ),
    [events, minVisibleLanes, eventHeight, eventGap, availableHeight, timeZone],
  );

  // Get visible and overflow events
  const visibleEvents = React.useMemo(
    () => capacityInfo.visibleLanes.flat(),
    [capacityInfo.visibleLanes],
  );
  const overflowEvents = React.useMemo(
    () => getOverflowEvents(capacityInfo),
    [capacityInfo],
  );

  return React.useMemo(
    () => ({
      containerRef,
      availableHeight,
      capacityInfo,
      visibleEvents,
      overflowEvents,
      hasOverflow: capacityInfo.hasOverflow,
      overflowCount: capacityInfo.overflowCount,
    }),
    [
      containerRef,
      availableHeight,
      capacityInfo,
      visibleEvents,
      overflowEvents,
    ],
  );
}
