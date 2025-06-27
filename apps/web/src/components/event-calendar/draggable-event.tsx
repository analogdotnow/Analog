"use client";

import { useRef } from "react";
import {
  PanInfo,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
// import { useDraggable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";
import { Temporal } from "temporal-polyfill";

// import { useCalendarSettings } from "@/atoms";
import {
  CalendarEvent,
  // EventHeight,
  EventItem,
  // useCalendarDnd,
} from "@/components/event-calendar";
import { MemoizedEventContextMenu } from "../event-context-menu";
import { ContextMenuTrigger } from "../ui/context-menu";
import { useSelectedEvents } from "@/atoms";

interface DraggableEventProps {
  event: CalendarEvent;
  view: "month" | "week" | "day";
  showTime?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  height?: number;
  isMultiDay?: boolean;
  multiDayWidth?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
  containerRef: React.RefObject<HTMLDivElement | null>;
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
  height,
  multiDayWidth,
  isFirstDay = true,
  isLastDay = true,
  "aria-hidden": ariaHidden,
  containerRef,
}: DraggableEventProps) {
  // const { activeId } = useCalendarDnd();
  const elementRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  // const [dragHandlePosition, setDragHandlePosition] = useState<{
  //   x: number;
  //   y: number;
  // } | null>(null);

  const { selectEvent, deselectEvent, selectedEvents } = useSelectedEvents();
  const top = useMotionValue(0);
  const topDrag = useMotionValue(0);
  const left = useMotionValue(0);
  const height2 = useMotionValue(height);
  const translate = useMotionTemplate`translate(${left}px, ${top}px)`;

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
  //       height: height || elementRef.current?.offsetHeight || null,
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
    // if (elementRef.current) {
    //   const rect = elementRef.current.getBoundingClientRect();
    //   setDragHandlePosition({
    //     x: e.clientX - rect.left,
    //     y: e.clientY - rect.top,
    //   });
    // }
  };

  // Don't render if this event is being dragged
  // if (isDragging || activeId === `${event.id}-${view}`) {
  //   return (
  //     <div
  //       ref={setNodeRef}
  //       className="opacity-0"
  //       style={{ height: height || "auto" }}
  //     />
  //   );
  // }

  // const style = transform
  //   ? {
  //       transform: CSS.Translate.toString(transform),
  //       height: height || "auto",
  //       width: isMultiDay && multiDayWidth ? `${multiDayWidth}%` : undefined,
  //     }
  //   : {
  //       height: height || "auto",
  //       width: isMultiDay && multiDayWidth ? `${multiDayWidth}%` : undefined,
  //     };

  // Handle touch start to track where on the event the user touched
  // const handleTouchStart = (e: React.TouchEvent) => {
  //   if (elementRef.current) {
  //     const rect = elementRef.current.getBoundingClientRect();
  //     const touch = e.touches[0];
  //     if (touch) {
  //       setDragHandlePosition({
  //         x: touch.clientX - rect.left,
  //         y: touch.clientY - rect.top,
  //       });
  //     }
  //   }
  // };

  const onDragStart = () => {
    if (!dragRef.current) {
      return;
    }
    console.log("onDragStart");
  };

  const onDrag = (event: PointerEvent, info: PanInfo) => {
    // console.log("onPan", startX, startY, info.point.x, info.point.y);
    // console.log(info.point.x - startX, info.point.y - startY);
    // console.log(info.offset.y, info.offset.x);
    top.set(info.offset.y);
    left.set(info.offset.x);
  };

  const onDragEnd = (e: PointerEvent, info: PanInfo) => {
    top.set(0);
    left.set(0);
    // TODO: Update the event position in the calendar

    // console.log("onPanEnd", e, info);

    const WEEK_CELLS_HEIGHT = 64;
    const minutes = Math.round((info.offset.y / WEEK_CELLS_HEIGHT) * 60);

    // round to the nearest 15 minutes

    // console.log(minute);
    // const minute = Math.floor((info.offset.y % EventHeight) / EventHeight * 60);

    // @ts-expect-error -- should both be of the same type
    const duration = event.start.until(event.end);

    // TODO: get number of columns (can we do this outside react?)
    const columnDelta = Math.round(
      (info.offset.x /
        (containerRef.current?.getBoundingClientRect().width || 0)) *
        7,
    );

    const dayAdjustedStart = event.start.add({
      days: columnDelta,
    });

    if (
      dayAdjustedStart instanceof Temporal.PlainDate ||
      dayAdjustedStart instanceof Temporal.PlainDate
    ) {
      const newEnd = dayAdjustedStart.add(duration);

      onEventUpdate?.({
        ...event,
        start: dayAdjustedStart,
        end: newEnd,
      });

      return;
    }

    // if (dayAdjustedStart instanceof Temporal.Instant) {
    //   d
    //   return;
    // }

    const newStart = dayAdjustedStart.add({
      minutes,
    });

    // console.log(newStart.toString());

    const roundedStart = newStart.round({
      smallestUnit: "minute",
      roundingMode: "halfExpand",
      roundingIncrement: 15,
    });

    // console.log(roundedStart.toString());

    const newEnd = roundedStart.add(duration);

    onEventUpdate?.({
      ...event,
      start: roundedStart,
      end: newEnd,
    });
  };

  const startY = useRef(0);
  const startHeight = useRef(height || 0);

  const onResizeTopStart = (event: PointerEvent) => {
    console.log("onResizeTopStart");
    startY.current = event.clientY;
    startHeight.current = event.height;
  };

  const onResizeBottomStart = (event: PointerEvent) => {
    console.log("onResizeBottomStart");
    startY.current = event.clientY;
    startHeight.current = height || 0;
  };

  const onResizeTop = (event: PointerEvent, info: PanInfo) => {
    console.log("onResizeTop", info.offset.y);
    //height2.set(startHeight.current - info.offset.y);
    topDrag.set(startY.current - info.offset.y);
  };

  const onResizeBottom = (event: PointerEvent, info: PanInfo) => {
    console.log("onResizeBottom", info.offset.y);
    height2.set(startHeight.current + info.offset.y);
  };

  const onResizeTopEnd = () => {
    console.log("onResizeTopEnd");
    topDrag.set(0);
    startY.current = 0;
    startHeight.current = 0;
    height2.set(startHeight.current);
  };

  const onResizeBottomEnd = () => {
    console.log("onResizeBottomEnd");
    topDrag.set(0);
    startY.current = 0;
    startHeight.current = 0;
    height2.set(startHeight.current);
  };

  return (
    <motion.div
      // ref={(node) => {
      //   setNodeRef(node);
      //   if (elementRef) elementRef.current = node;
      // }}
      // style={style}
      ref={dragRef}
      className="z-[9999] size-full touch-none"
      // onPanStart={onDragStart}
      // onPan={onDrag}
      // onPanEnd={onDragEnd}
      style={{ transform: translate, height: height2, top: topDrag }}
    >
      <MemoizedEventContextMenu event={event}>
        <ContextMenuTrigger>
          <EventItem
            event={event}
            view={view}
            showTime={showTime}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
            // isDragging={isDragging}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            // onTouchStart={handleTouchStart}
            // dndListeners={listeners}
            // dndAttributes={attributes}
            aria-hidden={ariaHidden}
          >
            <motion.div className="absolute inset-x-0 top-0 h-1 bg-red-500" onPanStart={onResizeTopStart} onPan={onResizeTop} onPanEnd={onResizeTopEnd} />
            <motion.div className="absolute inset-x-0 bottom-0 h-1 bg-red-500" onPanStart={onResizeBottomStart} onPan={onResizeBottom} onPanEnd={onResizeBottomEnd} />
            <motion.div className="absolute inset-x-0 inset-y-1 opacity-0" onPanStart={onDragStart} onPan={onDrag} onPanEnd={onDragEnd} />
          </EventItem>
        </ContextMenuTrigger>
      </MemoizedEventContextMenu>
    </motion.div>
  );
}
