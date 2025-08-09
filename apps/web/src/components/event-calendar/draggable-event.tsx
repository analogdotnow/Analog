"use client";

import * as React from "react";
import {
  PanInfo,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
import { Temporal } from "temporal-polyfill";

import { useCellHeight } from "@/atoms/cell-height";
import { useSetIsDragging, useSetIsResizing } from "@/atoms/drag-resize-state";
import type { CalendarEvent } from "@/components/event-calendar/types";
import { EventItem } from "@/components/event-calendar/event-item";
import { EventContextMenu } from "@/components/event-calendar/event-context-menu";
import { ContextMenuTrigger } from "@/components/ui/context-menu";
import type { Action } from "./hooks/use-optimistic-events";

interface DraggableEventProps {
  event: CalendarEvent;
  view: "month" | "week" | "day";
  showTime?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  dispatchAction: (action: Action) => void;
  height?: number;
  isMultiDay?: boolean;
  multiDayWidth?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows?: number;
  zIndex?: number;
}

interface IsMultiDayEventOptions {
  event: Pick<CalendarEvent, "start" | "end" | "allDay">;
  defaultTimeZone: string;
}

function isMultiDayEvent({ event, defaultTimeZone }: IsMultiDayEventOptions) {
  if (event.allDay) {
    return true;
  }

  const eventStart = event.start as Temporal.ZonedDateTime;
  const eventEnd = event.end as Temporal.ZonedDateTime;

  return (
    Temporal.PlainDate.compare(
      eventStart.withTimeZone(defaultTimeZone).toPlainDate(),
      eventEnd.withTimeZone(defaultTimeZone).toPlainDate(),
    ) !== 0
  );
}

export function DraggableEvent({
  event,
  view,
  showTime,
  onClick,
  height: initialHeight,
  dispatchAction,
  isFirstDay = true,
  isLastDay = true,
  "aria-hidden": ariaHidden,
  containerRef,
  rows,
  zIndex,
}: DraggableEventProps) {
  const dragRef = React.useRef<HTMLDivElement>(null);

  const eventRef = React.useRef(event);
  const heightRef = React.useRef(initialHeight);

  const dragStartRelative = React.useRef<{ x: number; y: number } | null>(null);
  const resizeStartRelativeY = React.useRef(0);

  React.useEffect(() => {
    eventRef.current = event;
    heightRef.current = initialHeight;
  }, [event, initialHeight]);

  const top = useMotionValue(0);
  const left = useMotionValue(0);
  const height = useMotionValue(initialHeight ?? "100%");
  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  const cellHeight = useCellHeight();
  const setIsDragging = useSetIsDragging();
  const setIsResizing = useSetIsResizing();

  React.useEffect(() => {
    height.set(initialHeight ?? "100%");
  }, [initialHeight, height]);

  const onDragStart = (e: PointerEvent, info: PanInfo) => {
    // Prevent possible text/image dragging flash on some browsers
    e.preventDefault();
    setIsDragging(true);

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    dragStartRelative.current = {
      x: info.point.x - rect.left,
      y: info.point.y - rect.top,
    };
  };

  const onDrag = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || !dragStartRelative.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;

    left.set(relativeX - dragStartRelative.current.x);
    top.set(relativeY - dragStartRelative.current.y);
  };

  const onDragEnd = (_e: PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    top.set(0);
    left.set(0);

    // @ts-expect-error -- should both be of the same type
    const duration = eventRef.current.start.until(eventRef.current.end);

    const columnDelta = Math.round(
      (info.offset.x /
        (containerRef.current?.getBoundingClientRect().width || 0)) *
        7,
    );

    // Calculate vertical movement relative to the container so that auto-scroll is taken into account.
    let deltaY = info.offset.y;

    if (containerRef.current && dragStartRelative.current !== null) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeCurrentY = info.point.y - rect.top;
      deltaY = relativeCurrentY - dragStartRelative.current.y;
    }

    dragStartRelative.current = null;

    if (view === "month") {
      if (!rows) {
        return;
      }

      const rowDelta = Math.round(
        (deltaY / (containerRef.current?.getBoundingClientRect().height || 0)) *
          rows,
      );

      const start = eventRef.current.start.add({
        days: columnDelta + rowDelta * 7,
      });
      const end = start.add(duration);

      dispatchAction({
        type: "update",
        event: { ...eventRef.current, start, end },
      });

      return;
    }

    if (view === "day") {
      if (eventRef.current.start instanceof Temporal.PlainDate) {
        return;
      }

      const minutes = Math.round((deltaY / cellHeight) * 60);
      const start = eventRef.current.start.add({ minutes }).round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "halfExpand",
      });

      const end = start.add(duration);

      dispatchAction({
        type: "update",
        event: { ...eventRef.current, start, end },
      });

      return;
    }

    if (eventRef.current.start instanceof Temporal.PlainDate) {
      const start = eventRef.current.start.add({ days: columnDelta });
      const end = start.add(duration);

      dispatchAction({
        type: "update",
        event: { ...eventRef.current, start, end },
      });

      return;
    }

    const minutes = Math.round((deltaY / cellHeight) * 60);
    const start = eventRef.current.start
      .add({ days: columnDelta })
      .add({ minutes })
      .round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "halfExpand",
      });

    const end = start.add(duration);

    dispatchAction({
      type: "update",
      event: { ...eventRef.current, start, end },
    });
  };

  const startHeight = React.useRef(0);

  const onResizeTopStart = (e: PointerEvent, info: PanInfo) => {
    e.preventDefault();

    if (!containerRef.current) {
      return;
    }

    setIsResizing(true);
    startHeight.current = heightRef.current ?? 0;

    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRelativeY.current = info.point.y - rect.top;
  };

  const onResizeBottomStart = (e: PointerEvent, info: PanInfo) => {
    e.preventDefault();

    if (!containerRef.current) {
      return;
    }

    setIsResizing(true);
    startHeight.current = heightRef.current ?? 0;

    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRelativeY.current = info.point.y - rect.top;
  };

  const onResizeTop = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = info.point.y - rect.top;
    const delta = relativeY - resizeStartRelativeY.current;

    height.set(startHeight.current - delta);
    top.set(delta);
  };

  const onResizeBottom = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = info.point.y - rect.top;
    const delta = relativeY - resizeStartRelativeY.current;

    height.set(startHeight.current + delta);
  };

  const updateStartTime = React.useCallback(
    (offsetY: number) => {
      const start = eventRef.current.start as
        | Temporal.ZonedDateTime
        | Temporal.Instant;
      const minutes = Math.round((offsetY / cellHeight) * 60);
      const rounded = start.add({ minutes }).round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "halfExpand",
      });

      dispatchAction({
        type: "update",
        event: { ...eventRef.current, start: rounded },
      });
    },
    [dispatchAction, cellHeight],
  );

  const updateEndTime = React.useCallback(
    (offsetY: number) => {
      const end = eventRef.current.end as
        | Temporal.ZonedDateTime
        | Temporal.Instant;
      const minutes = Math.round((offsetY / cellHeight) * 60);
      const rounded = end.add({ minutes }).round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "halfExpand",
      });

      dispatchAction({
        type: "update",
        event: { ...eventRef.current, end: rounded },
      });
    },
    [dispatchAction, cellHeight],
  );

  const onResizeTopEnd = (_: PointerEvent, info: PanInfo) => {
    setIsResizing(false);
    top.set(0);

    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = info.point.y - rect.top;
    const delta = relativeY - resizeStartRelativeY.current;

    updateStartTime(delta);

    resizeStartRelativeY.current = 0;
    startHeight.current = 0;
  };
  const onResizeBottomEnd = (_: PointerEvent, info: PanInfo) => {
    setIsResizing(false);
    top.set(0);

    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = info.point.y - rect.top;
    const delta = relativeY - resizeStartRelativeY.current;

    updateEndTime(delta);

    resizeStartRelativeY.current = 0;
    startHeight.current = 0;
  };

  if (event.allDay || view === "month") {
    return (
      <motion.div
        ref={dragRef}
        className="size-full"
        style={{ transform, height, top, zIndex }}
      >
        <EventContextMenu event={event} dispatchAction={dispatchAction}>
          <ContextMenuTrigger>
            <EventItem
              event={event}
              view={view}
              showTime={showTime}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
              onClick={onClick}
              onMouseDown={onClick}
              // onTouchStart={handleTouchStart}
              aria-hidden={ariaHidden}
            >
              {!event.readOnly ? (
                <>
                  <motion.div
                    className="absolute inset-x-0 inset-y-2 touch-pan-x touch-pan-y"
                    onPanStart={onDragStart}
                    onPan={onDrag}
                    onPanEnd={onDragEnd}
                  />
                </>
              ) : null}
            </EventItem>
          </ContextMenuTrigger>
        </EventContextMenu>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={dragRef}
      className="size-full"
      style={{ transform, height: height, zIndex }}
    >
      <EventContextMenu event={event} dispatchAction={dispatchAction}>
        <ContextMenuTrigger>
          <EventItem
            event={event}
            view={view}
            showTime={showTime}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
            onClick={onClick}
            onMouseDown={onClick}
            // onTouchStart={handleTouchStart}
            aria-hidden={ariaHidden}
          >
            {!event.readOnly ? (
              <>
                <motion.div
                  className="absolute inset-0 touch-pan-x touch-pan-y"
                  onPanStart={onDragStart}
                  onPan={onDrag}
                  onPanEnd={onDragEnd}
                />
                <motion.div
                  className="absolute inset-x-0 top-0 h-[min(15%,_0.25rem)] cursor-row-resize touch-pan-y"
                  onPanStart={onResizeTopStart}
                  onPan={onResizeTop}
                  onPanEnd={onResizeTopEnd}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-[min(15%,_0.25rem)] cursor-row-resize touch-pan-y"
                  onPanStart={onResizeBottomStart}
                  onPan={onResizeBottom}
                  onPanEnd={onResizeBottomEnd}
                />
              </>
            ) : null}
          </EventItem>
        </ContextMenuTrigger>
      </EventContextMenu>
    </motion.div>
  );
}
