import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { useEdgeAutoScroll } from "@/hooks/calendar/drag-and-drop/use-auto-scroll";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useNavigateTo } from "@/store/hooks";

function calculateTimeOffset(
  time: Temporal.PlainTime | Temporal.PlainDateTime,
  cellHeight: number,
) {
  return Math.max(
    0,
    time.hour * cellHeight + (time.minute * cellHeight) / 60 - cellHeight,
  );
}

interface UseScrollWeekViewProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

function useScrollWeekView({ scrollRef }: UseScrollWeekViewProps) {
  const cellHeight = useCalendarStore((s) => s.cellHeight);
  const navigateTo = useNavigateTo();

  return React.useCallback(
    (
      value: Temporal.PlainTime | Temporal.PlainDate | Temporal.PlainDateTime,
    ) => {
      if (!scrollRef.current) {
        return;
      }

      if (value instanceof Temporal.PlainDate) {
        navigateTo(value);

        return;
      }

      if (value instanceof Temporal.PlainDateTime) {
        navigateTo(value.toPlainDate());
      }

      scrollRef.current.scrollTo({
        top: calculateTimeOffset(value, cellHeight),
      });
    },
    [scrollRef, cellHeight, navigateTo],
  );
}

interface useWeekViewScrollProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLDivElement | null>;
}

export function useWeekViewScroll({
  scrollRef,
  headerRef,
}: useWeekViewScrollProps) {
  const scrollTo = useScrollWeekView({ scrollRef });

  useEdgeAutoScroll(scrollRef, { headerRef });

  const scrollToCurrentTime = React.useEffectEvent(() => {
    if (!scrollRef.current) {
      return;
    }

    const now = Temporal.Now.plainTimeISO();

    scrollTo(now);
  });

  React.useEffect(() => {
    scrollToCurrentTime();
  }, []);
}
