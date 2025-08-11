import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { cellHeightAtom } from "@/atoms/cell-height";

interface useScrollToCurrentTimeProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useScrollToCurrentTime({
  scrollContainerRef,
}: useScrollToCurrentTimeProps) {
  const cellHeight = useAtomValue(cellHeightAtom);

  const scrollToCurrentTime = React.useCallback(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    const { hour, minute } = Temporal.Now.plainTimeISO();
    const top = hour * cellHeight + (minute * cellHeight) / 60 - cellHeight;

    scrollContainerRef.current.scrollTo({
      top,
    });
  }, [scrollContainerRef, cellHeight]);

  return scrollToCurrentTime;
}
