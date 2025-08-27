import * as React from "react";

import { DragAwareWrapper } from "@/components/calendar/event/drag-aware-wrapper";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import type { PositionedEvent } from "@/components/calendar/utils/event";

interface WeekViewEventProps {
  positionedEvent: PositionedEvent;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function WeekViewEvent({
  positionedEvent,
  containerRef,
}: WeekViewEventProps) {
  return (
    <DragAwareWrapper
      key={positionedEvent.item.event.id}
      eventId={positionedEvent.item.event.id}
      className="absolute z-10"
      style={{
        top: `${positionedEvent.top}px`,
        height: `${positionedEvent.height}px`,
        left: `${positionedEvent.left * 100}%`,
        width: `${positionedEvent.width * 100}%`,
      }}
    >
      <DraggableEvent
        item={positionedEvent.item}
        view="week"
        showTime
        height={positionedEvent.height}
        containerRef={containerRef}
      />
    </DragAwareWrapper>
  );
}
