"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isAfter, isBefore, isSameDay } from "@repo/temporal";

import { DraggableEvent } from "@/components/calendar/event/draggable-event";
import { getGridPosition } from "@/components/calendar/utils/multi-day-layout";
import { DragAwareWrapper } from "../event/drag-aware-wrapper";
import { EventCollectionItem } from "../hooks/event-collection";

interface PositionedEventProps {
  y: number;
  item: EventCollectionItem;
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
  return (
    <PositionedContainer
      item={item}
      y={y}
      weekStart={weekStart}
      weekEnd={weekEnd}
    >
      <PositionedContent
        item={item}
        weekStart={weekStart}
        weekEnd={weekEnd}
        containerRef={containerRef}
        rows={rows}
        columns={columns}
      />
    </PositionedContainer>
  );
}

interface PositionedContainerProps {
  children: React.ReactNode;
  item: EventCollectionItem;
  y: number;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
}

function PositionedContainer({
  children,
  item,
  y,
  weekStart,
  weekEnd,
}: PositionedContainerProps) {
  const style = React.useMemo(() => {
    const { colStart, span } = getGridPosition(item, weekStart, weekEnd);

    return {
      gridColumn: `${colStart + 1} / span ${span}`,
      gridRow: y + 1,
    };
  }, [item, weekStart, weekEnd, y]);

  return (
    <DragAwareWrapper
      key={item.event.id}
      eventId={item.event.id}
      className="pointer-events-auto my-px min-w-0"
      style={style}
    >
      {children}
    </DragAwareWrapper>
  );
}

interface PositionedContentProps {
  item: EventCollectionItem;
  weekStart: Temporal.PlainDate;
  weekEnd: Temporal.PlainDate;
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows: number;
  columns: number;
}

function PositionedContent({
  item,
  weekStart,
  weekEnd,
  containerRef,
  rows,
  columns,
}: PositionedContentProps) {
  const { isFirstDay, isLastDay } = React.useMemo(() => {
    // Calculate actual first/last day based on event dates
    const eventStart = item.start.toPlainDate();
    const eventEnd = item.end.toPlainDate();

    // For single-day events, ensure they are properly marked as first and last day
    const isFirstDay =
      isAfter(eventStart, weekStart) || isSameDay(eventStart, weekStart);
    const isLastDay =
      isBefore(eventEnd, weekEnd) || isSameDay(eventEnd, weekEnd);

    return { isFirstDay, isLastDay };
  }, [item.start, item.end, weekStart, weekEnd]);

  return (
    <DraggableEvent
      item={item}
      view="month"
      containerRef={containerRef}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
      rows={rows}
      columns={columns}
    />
  );
}

export const MemoizedPositionedEvent = React.memo(PositionedEvent);
