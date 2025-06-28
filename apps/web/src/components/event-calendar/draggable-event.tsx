"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PanInfo,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
// import { useDraggable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";
import { Temporal } from "temporal-polyfill";

import { useSelectedEvents } from "@/atoms";
// import { useCalendarSettings } from "@/atoms";
import {
  CalendarEvent,
  // EventHeight,
  EventItem,
  // useCalendarDnd,
} from "@/components/event-calendar";
import { EventContextMenu } from "../event-context-menu";
import { ContextMenuTrigger } from "../ui/context-menu";

interface DraggableEventProps {
  event: CalendarEvent;
  view: "month" | "week" | "day";
  showTime?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onEventUpdate: (event: CalendarEvent) => void;
  height?: number;
  isMultiDay?: boolean;
  multiDayWidth?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows?: number;
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
  onEventUpdate,
  height: initialHeight,
  multiDayWidth,
  isFirstDay = true,
  isLastDay = true,
  "aria-hidden": ariaHidden,
  containerRef,
  rows,
}: DraggableEventProps) {
  const dragRef = useRef<HTMLDivElement>(null);

  const { selectEvent } = useSelectedEvents();
  const eventRef = useRef(event);
  const heightRef = useRef(initialHeight);

  useEffect(() => {
    eventRef.current = event;
    heightRef.current = initialHeight;
  }, [event, initialHeight]);

  const top = useMotionValue(0);
  const left = useMotionValue(0);
  const height = useMotionValue(initialHeight ?? "100%");
  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  useEffect(() => {
    height.set(initialHeight ?? "100%");
  }, [initialHeight, height]);

  // const { defaultTimeZone } = useCalendarSettings();

  // const isMultiDay = isMultiDayEvent({
  //   event,
  //   defaultTimeZone,
  // });

  // const { attributes, listeners, setNodeRef, transform, isDragging } =
  //   useDraggable({
  //     id: `${event.id}-${view}`,
  //     data: {
  //       event,
  //       view,
  //       initialHeight: initialHeight || elementRef.current?.offsetHeight || null,
  //       isMultiDay,
  //       multiDayWidth: multiDayWidth,
  //       dragHandlePosition,
  //       isFirstDay,
  //       isLastDay,
  //     },
  //   });

  // const [startX, setStartX] = useState(0);
  // const [startY, setStartY] = useState(0);

  // Handle mouse down to track where on the event the user clicked
  const handleMouseDown = (e: React.MouseEvent) => {
    selectEvent(event);
  };

  // Don't render if this event is being dragged
  // if (isDragging || activeId === `${event.id}-${view}`) {
  //   return (
  //     <div
  //       ref={setNodeRef}
  //       className="opacity-0"
  //       style={{ initialHeight: initialHeight || "auto" }}
  //     />
  //   );
  // }

  // const style = transform
  //   ? {
  //       transform: CSS.Translate.toString(transform),
  //       initialHeight: initialHeight || "auto",
  //       width: isMultiDay && multiDayWidth ? `${multiDayWidth}%` : undefined,
  //     }
  //   : {
  //       initialHeight: initialHeight || "auto",
  //       width: isMultiDay && multiDayWidth ? `${multiDayWidth}%` : undefined,
  //     };


  const [isDragging, setIsDragging] = useState(false);
  
  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDrag = (event: PointerEvent, info: PanInfo) => {
    top.set(info.offset.y);
    left.set(info.offset.x);
  };

  const onDragEnd = (_e: PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    top.set(0);
    left.set(0);

    const current = eventRef.current;
    // @ts-expect-error -- should both be of the same type
    const duration = current.start.until(current.end);
    
    const columnDelta = Math.round(
      (info.offset.x /
        (containerRef.current?.getBoundingClientRect().width || 0)) *
        7,
    );

    if (view === "month") {
      if (!rows) {
        return;
      }

      const rowDelta = Math.round(
        (info.offset.y /
          (containerRef.current?.getBoundingClientRect().height || 0)) *
          rows,
      );

      const start = current.start.add({ days: columnDelta + rowDelta * 5 });
      console.log("rowDelta", rowDelta);

      const end = current.start.add({ days: duration.days })

      onEventUpdate?.({ ...current, start, end });
      return;
    }


    if (current.start instanceof Temporal.PlainDate) {
      const start = current.start.add({ days: columnDelta });

      const end = current.start.add({ days: duration.days })

      onEventUpdate?.({ ...current, start, end });

      return;
    }


    const minutes = Math.round((info.offset.y / 64) * 60);
    const start = current.start.add({ days: columnDelta }).add({ minutes }).round({
      smallestUnit: "minute",
      roundingIncrement: 15,
      roundingMode: "halfExpand",
    });

    const end = start.add(duration);

    onEventUpdate?.({ ...current, start, end });
  };

  const startHeight = useRef(0);

  const onResizeTopStart = (_e: PointerEvent, info: PanInfo) => {
    startHeight.current = heightRef.current ?? 0;
    height.set(startHeight.current - info.offset.y);
    top.set(info.offset.y);
  };
  const onResizeBottomStart = (_e: PointerEvent, info: PanInfo) => {
    startHeight.current = heightRef.current ?? 0;
    height.set(startHeight.current + info.offset.y);
  };

  const onResizeTop = (_e: PointerEvent, info: PanInfo) => {
    height.set(startHeight.current - info.offset.y);
    top.set(info.offset.y);
  };

  const onResizeBottom = (_e: PointerEvent, info: PanInfo) => {
    height.set(startHeight.current + info.offset.y);
  };

  const updateStartTime = useCallback(
    (offsetY: number) => {
      const start = eventRef.current.start as
        | Temporal.ZonedDateTime
        | Temporal.Instant;
      const minutes = Math.round((offsetY / 64) * 60);
      const rounded = start.add({ minutes }).round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "halfExpand",
      });
      onEventUpdate?.({ ...eventRef.current, start: rounded });
    },
    [onEventUpdate],
  );

  const updateEndTime = useCallback(
    (offsetY: number) => {
      const end = eventRef.current.end as
        | Temporal.ZonedDateTime
        | Temporal.Instant;
      const minutes = Math.round((offsetY / 64) * 60);
      const rounded = end.add({ minutes }).round({
        smallestUnit: "minute",
        roundingIncrement: 15,
        roundingMode: "halfExpand",
      });
      
      onEventUpdate?.({ ...eventRef.current, end: rounded });
    },
    [onEventUpdate],
  );

  const onResizeTopEnd = (_: PointerEvent, info: PanInfo) => {
    top.set(0);
    updateStartTime(info.offset.y);
  };
  const onResizeBottomEnd = (_: PointerEvent, info: PanInfo) => {
    top.set(0);
    updateEndTime(info.offset.y);
  };

  if (event.allDay || view === "month") {
    return (
      <motion.div
        ref={dragRef}
        className="z-[9999] size-full touch-none"
        style={{ transform, height, top }}
      >
        <EventContextMenu event={event}>
          <ContextMenuTrigger>
            <EventItem
              event={event}
              view={view}
              showTime={showTime}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
              onClick={onClick}
              onMouseDown={handleMouseDown}
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
      className="z-[9999] size-full touch-none"
      style={{ transform, height: height }}
    >
      <EventContextMenu event={event}>
        <ContextMenuTrigger>
          <EventItem
            event={event}
            view={view}
            showTime={showTime}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            // onTouchStart={handleTouchStart}
            aria-hidden={ariaHidden}
          >
            {!event.readOnly ? (
              <>
                <motion.div
                  className="absolute inset-x-0 top-0 h-1 cursor-row-resize touch-pan-y"
                  onPanStart={onResizeTopStart}
                  onPan={onResizeTop}
                  onPanEnd={onResizeTopEnd}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-1 cursor-row-resize touch-pan-y"
                  onPanStart={onResizeBottomStart}
                  onPan={onResizeBottom}
                  onPanEnd={onResizeBottomEnd}
                />
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
