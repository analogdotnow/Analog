"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, isSameDay } from "@repo/temporal";

import { DisplayItemComponent } from "@/components/calendar/display-item/display-item";
import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { getGridPosition } from "@/components/calendar/utils/multi-day-layout";
import { InlineDisplayItem, isEvent } from "@/lib/display-item";
import { DisplayItemContainer } from "../event/display-item-container";

interface PositionedEventProps {
  y: number;
  item: InlineDisplayItem;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows: number;
  columns: number;
}

export function PositionedEvent({
  y,
  item,
  weekStart,
  weekEnd,
  containerRef,
  rows,
  columns,
}: PositionedEventProps) {
  const style = React.useMemo(() => {
    const { colStart, span } = getGridPosition(item, weekStart, weekEnd);

    return {
      gridColumn: `${colStart + 1} / span ${span}`,
      gridRow: y + 1,
    };
  }, [item, weekStart, weekEnd, y]);

  const { isFirstDay, isLastDay } = React.useMemo(() => {
    const itemStart = item.start.toPlainDate();
    const itemEnd = item.end.toPlainDate();

    const isFirstDay =
      isAfter(itemStart, weekStart) || isSameDay(itemStart, weekStart);
    const isLastDay = isBefore(itemEnd, weekEnd) || isSameDay(itemEnd, weekEnd);

    return { isFirstDay, isLastDay };
  }, [item.start, item.end, weekStart, weekEnd]);

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
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        rows={rows}
        columns={columns}
      />
    </DisplayItemContainer>
  );
}

export const MemoizedPositionedEvent = React.memo(PositionedEvent);
