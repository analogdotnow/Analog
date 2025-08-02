import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { useCellHeight } from "@/atoms";

interface useScrollToCurrentTimeProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollToCurrentTime({
  scrollContainerRef,
}: useScrollToCurrentTimeProps) {
  const cellHeight = useCellHeight();
  const scrollToCurrentTime = React.useCallback(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const { hour, minute } = Temporal.Now.plainTimeISO();
    const top = hour * cellHeight + (minute * cellHeight) / 60;

    scrollContainerRef.current.scrollTo({
      top,
    });
  }, [scrollContainerRef, cellHeight]);

  return scrollToCurrentTime;
}
