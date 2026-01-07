import * as React from "react";

import { useContainerSize } from "@/hooks/use-container-size";
import { InlineDisplayItem } from "@/lib/display-item";
import { EventGap, EventHeight } from "../constants";
import {
  organizeItemsWithOverflow,
  type DisplayItemCapacityInfo,
} from "../utils/multi-day-layout";

interface UseMultiDayOverflowOptions {
  items: InlineDisplayItem[];
  timeZone: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  minVisibleLanes?: number;
}

export interface UseMultiDayOverflowResult {
  capacityInfo: DisplayItemCapacityInfo;
  overflowItems: InlineDisplayItem[];
}

export function useMultiDayOverflow({
  items,
  timeZone,
  containerRef,
  minVisibleLanes,
}: UseMultiDayOverflowOptions): UseMultiDayOverflowResult {
  const { height } = useContainerSize(containerRef);

  return React.useMemo(() => {
    const capacityInfo = organizeItemsWithOverflow({
      items,
      availableHeight: minVisibleLanes
        ? Math.max(minVisibleLanes * (EventHeight + EventGap), height)
        : height,
      timeZone,
      itemHeight: EventHeight,
      itemGap: EventGap,
    });

    return {
      capacityInfo,
      overflowItems: capacityInfo.overflowLanes.flat(),
    };
  }, [items, minVisibleLanes, height, timeZone]);
}
