import * as React from "react";

import { DisplayItemComponent } from "@/components/calendar/display-item/display-item";
import { DisplayItemContainer } from "@/components/calendar/event/display-item-container";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import type { PositionedDisplayItem } from "@/components/calendar/utils/positioning";
import { isEvent } from "@/lib/display-item";

interface WeekViewEventProps {
  positionedItem: PositionedDisplayItem;
  containerRef: React.RefObject<HTMLDivElement | null>;
  columns: number;
}

export function WeekViewEvent({
  positionedItem,
  containerRef,
  columns,
}: WeekViewEventProps) {
  const style = React.useMemo(() => {
    return {
      top: `${positionedItem.top}px`,
      height: `${positionedItem.height}px`,
      left: `${positionedItem.left * 100}%`,
      width: `${positionedItem.width * 100}%`,
    };
  }, [positionedItem]);

  if (!isEvent(positionedItem.item)) {
    return (
      <DisplayItemContainer
        key={positionedItem.item.id}
        item={positionedItem.item}
        className="absolute z-10"
        style={style}
      >
        <DisplayItemComponent item={positionedItem.item} view="week" showTime />
      </DisplayItemContainer>
    );
  }

  return (
    <DisplayItemContainer
      key={positionedItem.item.id}
      item={positionedItem.item}
      className="absolute z-10"
      style={style}
    >
      <DraggableEvent
        item={positionedItem.item}
        view="week"
        showTime
        height={positionedItem.height}
        containerRef={containerRef}
        columns={columns}
      />
    </DisplayItemContainer>
  );
}
