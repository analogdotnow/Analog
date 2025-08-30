import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { DragAwareWrapper } from "@/components/calendar/event/drag-aware-wrapper";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { getGridPosition } from "@/components/calendar/utils/multi-day-layout";
import { EventCollectionItem } from "../hooks/event-collection";

interface WeekViewAllDayEventProps {
  y: number;
  item: EventCollectionItem;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekViewAllDayEvent({
  y,
  item,
  weekStart,
  weekEnd,
  containerRef,
}: WeekViewAllDayEventProps) {
  const { colStart, span } = getGridPosition(item, weekStart, weekEnd);

  const { isFirstDay, isLastDay } = React.useMemo(() => {
    // For single-day events, ensure they are properly marked as first and last day
    const isFirstDay = Temporal.PlainDate.compare(item.start, weekStart) >= 0;
    const isLastDay = Temporal.PlainDate.compare(item.end, weekEnd) <= 0;

    return { isFirstDay, isLastDay };
  }, [item.start, item.end, weekStart, weekEnd]);

  return (
    <DragAwareWrapper
      key={item.event.id}
      eventId={item.event.id}
      className="pointer-events-auto my-[1px] min-w-0"
      style={{
        // Add 1 to colStart to account for the time column
        gridColumn: `${colStart + 2} / span ${span}`,
        gridRow: y + 1,
      }}
    >
      <DraggableEvent
        item={item}
        view="month"
        containerRef={containerRef}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        rows={1}
      />
    </DragAwareWrapper>
  );
}
