import * as React from "react";

import { EVENT_GAP, EVENT_HEIGHT } from "@/components/calendar/constants";
import { useContainerSize } from "@/hooks/use-container-size";

export function useLaneCapacity(
  overflowRef: React.RefObject<HTMLDivElement | null>,
) {
  const { height } = useContainerSize(overflowRef);

  return React.useMemo(() => {
    const laneHeight = EVENT_HEIGHT + EVENT_GAP;

    return Math.floor(height / laneHeight);
  }, [height]);
}
