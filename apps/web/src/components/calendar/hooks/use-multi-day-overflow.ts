import * as React from "react";

import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { EventGap, EventHeight } from "../constants";
import {
  getOverflowEvents,
  organizeEventsWithOverflow,
  type EventCapacityInfo,
} from "../utils/multi-day-layout";

interface UseMultiDayOverflowOptions {
  events: EventCollectionItem[];
  timeZone: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  eventHeight?: number;
  eventGap?: number;
  minVisibleLanes?: number;
}

export interface UseMultiDayOverflowResult {
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
  containerRef,
  eventHeight = EventHeight,
  eventGap = EventGap,
  minVisibleLanes,
}: UseMultiDayOverflowOptions): UseMultiDayOverflowResult {
  const observerRef = React.useRef<ResizeObserver | null>(null);
  const [availableHeight, setAvailableHeight] = React.useState<number>(0);

  // Measure available height
  const measureHeight = React.useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    setAvailableHeight(rect.height);
  }, [containerRef]);

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
  }, [containerRef, measureHeight]);

  return React.useMemo(
    () => {
      const capacityInfo = organizeEventsWithOverflow(
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
      );

      const visibleEvents = capacityInfo.visibleLanes.flat();
      const overflowEvents = getOverflowEvents(capacityInfo);

      return {
        availableHeight,
        capacityInfo,
        visibleEvents,
        overflowEvents,
        hasOverflow: capacityInfo.hasOverflow,
        overflowCount: capacityInfo.overflowCount,
      };
    },
    [events, minVisibleLanes, eventHeight, eventGap, availableHeight, timeZone],
  );
}
