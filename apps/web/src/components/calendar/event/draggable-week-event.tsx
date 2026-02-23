"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type PanInfo,
} from "motion/react";

import { useContainer } from "@/components/calendar/context/container-provider";
import { EventContextMenu } from "@/components/calendar/event/event-context-menu";
import {
  MonthEventItem,
  WeekEventItem,
} from "@/components/calendar/event/event-item";
import {
  isAllDayOrMultiDay,
  isMultiDayItem,
} from "@/components/calendar/utils/positioning/inline-items";
import { useInfiniteWeekViewDays } from "@/components/calendar/week-view/infinite-week-view-day-provider";
import {
  calculateColumnIndex,
  calculateDate,
  calculateRelativeOffset,
  calculateTimeFromRelativeOffset,
  computeTimelineWidth,
} from "@/components/calendar/week-view/utils";
import { ContextMenuTrigger } from "@/components/ui/context-menu";
import { EventDisplayItem } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { useCellHeight, useDraggingEventId } from "@/store/hooks";
import { DragPreviewPortal } from "./drag-preview-portal";
import { useDraggable } from "./use-draggable";
import { useDraggableEventActions } from "./use-draggable-event-actions";
import { useVerticalResizable } from "./use-vertical-resizable";

interface DraggableWeekEventProps {
  item: EventDisplayItem;
  height?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  zIndex?: number;
}

export function DraggableWeekEvent({
  item,
  height: initialHeight,
  isFirstDay = true,
  isLastDay = true,
  zIndex,
}: DraggableWeekEventProps) {
  "use memo";

  const { containerRef } = useContainer();
  const { scrollRef, anchor, columns } = useInfiniteWeekViewDays();

  const cellHeight = useCellHeight();

  const {
    setIsDragging,
    setIsResizing,
    moveEvent,
    moveAllDayEvent,
    updateStartTime,
    updateEndTime,
  } = useDraggableEventActions(item, cellHeight);

  const eventElementRef = React.useRef<HTMLDivElement | null>(null);

  const draggingEventId = useDraggingEventId();
  const isDragging = draggingEventId === item.event.id;

  const left = useMotionValue(0);
  const top = useMotionValue(0);

  const height = useMotionValue(initialHeight ?? 0);

  const grabOffsetX = useMotionValue(0);
  const grabOffsetY = useMotionValue(0);

  const previewX = useMotionValue(0);
  const previewY = useMotionValue(0);

  const previewWidth = useMotionValue(0);
  const previewHeight = useMotionValue(0);

  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  const onDragStart = React.useEffectEvent(
    (_event: PointerEvent, info: PanInfo) => {
      setIsDragging(true);

      const rect = eventElementRef.current!.getBoundingClientRect();

      previewWidth.set(rect.width);
      previewHeight.set(rect.height);

      grabOffsetX.set(info.point.x - (rect.left - left.get()));
      grabOffsetY.set(info.point.y - (rect.top - top.get()));

      previewX.set(info.point.x - grabOffsetX.get());
      previewY.set(info.point.y - grabOffsetY.get());

      left.set(0);
      top.set(0);
    },
  );

  const onDrag = React.useEffectEvent((_event: PointerEvent, info: PanInfo) => {
    previewX.set(info.point.x - grabOffsetX.get());
    previewY.set(info.point.y - grabOffsetY.get());
  });

  const onDragEnd = React.useEffectEvent(
    (_event: PointerEvent, info: PanInfo) => {
      if (!scrollRef.current) {
        return;
      }

      previewX.set(info.point.x - grabOffsetX.get());
      previewY.set(info.point.y - grabOffsetY.get());

      setIsDragging(false);

      const timelineWidth = computeTimelineWidth({
        scrollElement: scrollRef.current,
      });
      const columnWidth = scrollRef.current.scrollWidth / columns.total;

      const columnIndex = calculateColumnIndex({
        scrollLeft: scrollRef.current.scrollLeft,
        columnWidth,
        cursorX: info.point.x,
        timelineWidth,
      });

      if (columnIndex === null) {
        return;
      }

      const initialColumnOffset = Math.floor(grabOffsetX.get() / columnWidth);

      const date = calculateDate({
        anchor,
        columnIndex,
        columns,
        initialColumnOffset,
      });

      if (item.event.allDay || isMultiDayItem(item)) {
        moveAllDayEvent({ date });

        return false;
      }

      const columnHeight = cellHeight * 24;

      const relativeOffsetY = calculateRelativeOffset({
        cursorY: info.point.y,
        containerTop: containerRef.current!.getBoundingClientRect().top,
        columnHeight,
        initialOffsetY: grabOffsetY.get(),
      });

      if (!relativeOffsetY) {
        return;
      }

      const time = calculateTimeFromRelativeOffset({
        relativeOffset: relativeOffsetY,
        columnHeight,
      });

      moveEvent({ date, time });

      return false;
    },
  );

  const { onPanStart, onPan, onPanEnd } = useDraggable({
    containerRef,
    left,
    top,
    onDragStart,
    onDrag,
    onDragEnd,
  });

  const onTopResizeEnd = (delta: number) => {
    setIsResizing(false);
    updateStartTime(delta);
  };

  const onBottomResizeEnd = (delta: number) => {
    setIsResizing(false);
    updateEndTime(delta);
  };

  const handles = useVerticalResizable({
    containerRef,
    top,
    height,
    onResizeStart: () => setIsResizing(true),
    onTopResizeEnd,
    onBottomResizeEnd,
  });

  // When the event time updates (optimistic or confirmed), reset the local
  // transform so the item renders at its new computed position without a
  // visual flash. Use layout effect to apply before paint to avoid flicker.
  React.useLayoutEffect(() => {
    top.set(0);
    left.set(0);
    height.set(initialHeight ?? 0);
  }, [
    top,
    left,
    height,
    initialHeight,
    item.event.start,
    item.event.end,
    item.event.title,
  ]);

  if (isAllDayOrMultiDay(item)) {
    return (
      <>
        {isDragging ? (
          <DragPreviewPortal
            item={item}
            isAllDayItem
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
            x={previewX}
            y={previewY}
            width={previewWidth}
            height={previewHeight}
          />
        ) : null}
        <motion.div
          ref={eventElementRef}
          className={cn("size-full touch-none", isDragging && "hidden")}
          style={{
            transform,
            zIndex,
          }}
        >
          <EventContextMenu event={item.event}>
            <ContextMenuTrigger>
              <MonthEventItem
                item={item}
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
              >
                <motion.div
                  className="absolute inset-0 touch-none"
                  onPanStart={onPanStart}
                  onPan={onPan}
                  onPanEnd={onPanEnd}
                />
              </MonthEventItem>
            </ContextMenuTrigger>
          </EventContextMenu>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {isDragging ? (
        <DragPreviewPortal
          item={item}
          isAllDayItem={false}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
          x={previewX}
          y={previewY}
          width={previewWidth}
          height={previewHeight}
        />
      ) : null}
      <motion.div
        ref={eventElementRef}
        className={cn("size-full touch-none", isDragging && "hidden")}
        style={{
          transform,
          height,
          zIndex,
        }}
      >
        <EventContextMenu event={item.event}>
          <ContextMenuTrigger className="size-full">
            <WeekEventItem
              item={item}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
            >
              <motion.div
                className="absolute inset-0 touch-none"
                onPanStart={onPanStart}
                onPan={onPan}
                onPanEnd={onPanEnd}
              />
              <motion.div
                className="absolute inset-x-0 top-0 h-[min(15%,0.25rem)] cursor-row-resize touch-none"
                onPanStart={handles.top.onPanStart}
                onPan={handles.top.onPan}
                onPanEnd={handles.top.onPanEnd}
              />
              <motion.div
                className="absolute inset-x-0 bottom-0 h-[min(15%,0.25rem)] cursor-row-resize touch-none"
                onPanStart={handles.bottom.onPanStart}
                onPan={handles.bottom.onPan}
                onPanEnd={handles.bottom.onPanEnd}
              />
            </WeekEventItem>
          </ContextMenuTrigger>
        </EventContextMenu>
      </motion.div>
    </>
  );
}
