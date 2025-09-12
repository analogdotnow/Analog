"use client";

import * as React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  PanInfo,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "motion/react";
import { Temporal } from "temporal-polyfill";

import { cellHeightAtom } from "@/atoms/cell-height";
import {
  addDraggedEventIdAtom,
  isResizingAtom,
  removeDraggedEventIdAtom,
} from "@/atoms/drag-resize-state";
import { EventContextMenu } from "@/components/calendar/event/event-context-menu";
import { EventItem } from "@/components/calendar/event/event-item";
import { ContextMenuTrigger } from "@/components/ui/context-menu";
import { useUpdateAction } from "../flows/update-event/use-update-action";
import { useGlobalCursor } from "../hooks/drag-and-drop/use-global-cursor";
import type { EventCollectionItem } from "../hooks/event-collection";
import { useSelectAction } from "../hooks/use-optimistic-mutations";
import { getEventInForm } from "@/components/event-form/atoms/form";

interface DraggableEventProps {
  item: EventCollectionItem;
  view: "month" | "week" | "day";
  showTime?: boolean;
  height?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
  containerRef: React.RefObject<HTMLDivElement | null>;
  rows?: number;
  zIndex?: number;
}

export function DraggableEvent({
  item,
  view,
  showTime,
  height: initialHeight,
  isFirstDay = true,
  isLastDay = true,
  containerRef,
  rows,
  zIndex,
  ...props
}: DraggableEventProps) {
  const dragRef = React.useRef<HTMLDivElement>(null);

  const eventRef = React.useRef(item.event);
  const heightRef = React.useRef(initialHeight);

  const dragStartRelative = React.useRef<{ x: number; y: number } | null>(null);
  const resizeStartRelativeY = React.useRef(0);

  const eventInFormAtom = React.useMemo(
    () => getEventInForm(item.event.id),
    [item.event.id],
  );

  const eventInForm = useAtomValue(eventInFormAtom);

  React.useEffect(() => {
    eventRef.current = eventInForm ?? item.event;
    console.log("initialHeight", initialHeight);
    if (initialHeight || heightRef.current !== initialHeight) {
      heightRef.current = initialHeight;
    }
  }, [item.event, eventInForm, initialHeight]);

  const top = useMotionValue(0);
  const left = useMotionValue(0);
  const height = useMotionValue(initialHeight ?? "100%");
  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  const cellHeight = useAtomValue(cellHeightAtom);
  const setIsResizing = useSetAtom(isResizingAtom);
  const addDraggedEventId = useSetAtom(addDraggedEventIdAtom);
  const removeDraggedEventId = useSetAtom(removeDraggedEventIdAtom);

  const updateAction = useUpdateAction();
  const { setCursor, resetCursor } = useGlobalCursor();

  const onDragStart = (e: PointerEvent, info: PanInfo) => {
    // Prevent possible text/image dragging flash on some browsers
    e.preventDefault();
    addDraggedEventId(item.event.id);

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    dragStartRelative.current = {
      x: info.point.x - rect.left,
      y: info.point.y - rect.top,
    };
  };

  const onDrag = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current || !dragStartRelative.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;

    left.set(relativeX - dragStartRelative.current.x);
    top.set(relativeY - dragStartRelative.current.y);
  };

  const onDragEnd = (_e: PointerEvent, info: PanInfo) => {
    removeDraggedEventId(item.event.id);
    // Do not reset transform immediately to avoid flashback to original
    // position. We'll reset when the event data updates optimistically.

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

      updateAction({
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

      updateAction({
        event: { ...eventRef.current, start, end },
      });

      return;
    }

    if (eventRef.current.start instanceof Temporal.PlainDate) {
      const start = eventRef.current.start.add({ days: columnDelta });
      const end = start.add(duration);

      updateAction({
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

    updateAction({
      event: { ...eventRef.current, start, end },
    });
  };

  // When the event time updates (optimistic or confirmed), reset the local
  // transform so the item renders at its new computed position without a
  // visual flash back to the original slot.
  React.useEffect(() => {
    top.set(0);
    left.set(0);
    height.set(initialHeight ?? "100%");
  }, [top, left, initialHeight, height, item.event.start, item.event.end]);

  const startHeight = React.useRef(0);
  const resizeInitializedRef = React.useRef(false);

  const onResizeTopStart = (e: PointerEvent, info: PanInfo) => {
    e.preventDefault();
    setCursor("row-resize");

    if (!containerRef.current) {
      return;
    }

    setIsResizing(true);
    startHeight.current = heightRef.current ?? 0;

    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRelativeY.current = info.point.y - rect.top;
    resizeInitializedRef.current = true;
  };

  const onResizeBottomStart = (e: PointerEvent, info: PanInfo) => {
    e.preventDefault();
    setCursor("row-resize");

    if (!containerRef.current) {
      return;
    }

    setIsResizing(true);
    startHeight.current = heightRef.current ?? 0;

    const rect = containerRef.current.getBoundingClientRect();
    resizeStartRelativeY.current = info.point.y - rect.top;
    resizeInitializedRef.current = true;
  };

  const onResizeTop = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    // Guard against onPan firing before onPanStart by lazily initializing
    if (!resizeInitializedRef.current) {
      setIsResizing(true);
      startHeight.current = heightRef.current ?? 0;
      resizeStartRelativeY.current = info.point.y - rect.top;
      resizeInitializedRef.current = true;
    }
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
    // Guard against onPan firing before onPanStart by lazily initializing
    if (!resizeInitializedRef.current) {
      setIsResizing(true);
      startHeight.current = heightRef.current ?? 0;
      resizeStartRelativeY.current = info.point.y - rect.top;
      resizeInitializedRef.current = true;
    }
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

      updateAction({
        event: { ...eventRef.current, start: rounded },
      });
    },
    [updateAction, cellHeight],
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

      updateAction({
        event: { ...eventRef.current, end: rounded },
      });
    },
    [updateAction, cellHeight],
  );

  const onResizeTopEnd = (_: PointerEvent, info: PanInfo) => {
    setIsResizing(false);
    resetCursor();
    // Keep the visual offset until optimistic update lands to avoid flashback
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = info.point.y - rect.top;
    const delta = relativeY - resizeStartRelativeY.current;

    updateStartTime(delta);

    resizeStartRelativeY.current = 0;
    startHeight.current = 0;
    resizeInitializedRef.current = false;
  };

  const onResizeBottomEnd = (_: PointerEvent, info: PanInfo) => {
    setIsResizing(false);
    resetCursor();

    // Keep the visual state until optimistic update applies
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = info.point.y - rect.top;
    const delta = relativeY - resizeStartRelativeY.current;

    updateEndTime(delta);

    resizeStartRelativeY.current = 0;
    startHeight.current = 0;
    resizeInitializedRef.current = false;
  };

  const selectAction = useSelectAction();

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectAction(item.event);
    },
    [item.event, selectAction],
  );

  if (item.event.allDay || view === "month") {
    return (
      <motion.div
        ref={dragRef}
        className="size-full touch-none"
        style={{ transform, height, top, zIndex }}
      >
        <EventContextMenu event={item.event}>
          <ContextMenuTrigger>
            <EventItem
              item={item}
              view={view}
              showTime={showTime}
              isFirstDay={isFirstDay}
              isLastDay={isLastDay}
              onClick={onClick}
              onMouseDown={onClick}
              {...props}
            >
              {!item.event.readOnly ? (
                <>
                  <motion.div
                    className="absolute inset-x-0 inset-y-2 touch-none"
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
      className="size-full touch-none"
      style={{ transform, height, zIndex }}
    >
      <EventContextMenu event={item.event}>
        <ContextMenuTrigger>
          <EventItem
            item={item}
            view={view}
            showTime={showTime}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
            onClick={onClick}
            onMouseDown={onClick}
            {...props}
          >
            {!item.event.readOnly ? (
              <>
                <motion.div
                  className="absolute inset-0 touch-none"
                  onPanStart={onDragStart}
                  onPan={onDrag}
                  onPanEnd={onDragEnd}
                />
                <motion.div
                  className="absolute inset-x-0 top-0 h-[min(15%,_0.25rem)] cursor-row-resize touch-none"
                  onPanStart={onResizeTopStart}
                  onPan={onResizeTop}
                  onPanEnd={onResizeTopEnd}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-[min(15%,_0.25rem)] cursor-row-resize touch-none"
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
