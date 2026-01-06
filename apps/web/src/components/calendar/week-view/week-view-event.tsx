import * as React from "react";

import { DragAwareWrapper } from "@/components/calendar/event/drag-aware-wrapper";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import type { PositionedEvent } from "@/components/calendar/utils/positioning";

interface WeekViewEventProps {
  positionedEvent: PositionedEvent;
  containerRef: React.RefObject<HTMLDivElement | null>;
  columns: number;
}

export function WeekViewEvent({
  positionedEvent,
  containerRef,
  columns,
}: WeekViewEventProps) {
  const style = React.useMemo(() => {
    return {
      top: `${positionedEvent.top}px`,
      height: `${positionedEvent.height}px`,
      left: `${positionedEvent.left * 100}%`,
      width: `${positionedEvent.width * 100}%`,
    };
  }, [positionedEvent]);

  return (
    <DragAwareWrapper
      key={positionedEvent.item.event.id}
      eventId={positionedEvent.item.event.id}
      className="absolute z-10"
      style={style}
    >
      <DraggableEvent
        item={positionedEvent.item}
        view="week"
        showTime
        height={positionedEvent.height}
        containerRef={containerRef}
        columns={columns}
      />
    </DragAwareWrapper>
  );
}
