"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { DisplayItemComponent } from "@/components/calendar/display-item/display-item";
import { DisplayItemContainer } from "@/components/calendar/event/display-item-container";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { getGridPosition } from "@/components/calendar/utils/multi-day-layout";
import { InlineDisplayItem, isEvent } from "@/lib/display-item";

interface WeekViewAllDayEventProps {
  y: number;
  item: InlineDisplayItem;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
  containerRef: React.RefObject<HTMLDivElement | null>;
  columns: number;
}

export function WeekViewAllDayEvent({
  y,
  item,
  weekStart,
  weekEnd,
  containerRef,
  columns,
}: WeekViewAllDayEventProps) {
  const { colStart, span } = getGridPosition(item, weekStart, weekEnd);

  const { isFirstDay, isLastDay } = React.useMemo(() => {
    const isFirstDay = Temporal.PlainDate.compare(item.start, weekStart) >= 0;
    const isLastDay = Temporal.PlainDate.compare(item.end, weekEnd) <= 0;

    return { isFirstDay, isLastDay };
  }, [item.start, item.end, weekStart, weekEnd]);

  const style = {
    gridColumn: `${colStart + 2} / span ${span}`,
    gridRow: y + 1,
  };

  if (!isEvent(item)) {
    return (
      <DisplayItemContainer
        key={item.id}
        item={item}
        className="pointer-events-auto my-px min-w-0"
        style={style}
      >
        <DisplayItemComponent
          item={item}
          view="month"
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
        />
      </DisplayItemContainer>
    );
  }

  return (
    <DisplayItemContainer
      key={item.id}
      item={item}
      className="pointer-events-auto my-px min-w-0"
      style={style}
    >
      <DraggableEvent
        item={item}
        view="month"
        containerRef={containerRef}
        columns={columns}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        rows={1}
      />
    </DisplayItemContainer>
  );
}
