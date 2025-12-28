import * as React from "react";

import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { useContainerSize } from "@/hooks/use-container-size";
import { EventGap, EventHeight } from "../constants";
import {
  organizeEventsWithOverflow,
  type EventCapacityInfo,
} from "../utils/multi-day-layout";

interface UseMultiDayOverflowOptions {
  events: EventCollectionItem[];
  timeZone: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  minVisibleLanes?: number;
}

export interface UseMultiDayOverflowResult {
  capacityInfo: EventCapacityInfo;
  overflowEvents: EventCollectionItem[];
}

export function useMultiDayOverflow({
  events,
  timeZone,
  containerRef,
  minVisibleLanes,
}: UseMultiDayOverflowOptions): UseMultiDayOverflowResult {
  const { height } = useContainerSize(containerRef);

  return React.useMemo(() => {
    const capacityInfo = organizeEventsWithOverflow({
      events,
      availableHeight: minVisibleLanes
        ? Math.max(minVisibleLanes * (EventHeight + EventGap), height)
        : height,
      timeZone,
      eventHeight: EventHeight,
      eventGap: EventGap,
    });

    return {
      capacityInfo,
      overflowEvents: capacityInfo.overflowLanes.flat(),
    };
  }, [events, minVisibleLanes, height, timeZone]);
}
