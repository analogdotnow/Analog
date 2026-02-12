"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import {
  PanInfo,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";

import { useContainer } from "@/components/calendar/context/container-provider";
import { EventContextMenu } from "@/components/calendar/event/event-context-menu";
import { MonthEventItem } from "@/components/calendar/event/event-item";
import { usePartialUpdateAction } from "@/components/calendar/flows/update-event/use-update-action";
import {
  calculateColumnOffset,
  calculateRowOffset,
} from "@/components/calendar/month-view/utils";
import { getEventInForm } from "@/components/event-form/atoms/form";
import { ContextMenuTrigger } from "@/components/ui/context-menu";
import { EventDisplayItem } from "@/lib/display-item";
import { useSetDraggingEventId } from "@/store/hooks";

interface GetColumnOffsetOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  info: PanInfo;
  columns: number;
}

function getColumnOffset({
  containerRef,
  info,
  columns,
}: GetColumnOffsetOptions) {
  const containerRect = containerRef.current?.getBoundingClientRect();

  if (!containerRect || containerRect.width <= 0 || columns <= 0) {
    return 0;
  }

  return calculateColumnOffset({
    deltaX: info.offset.x,
    containerWidth: containerRect.width,
    columns,
  });
}

interface GetRowOffsetOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  deltaY: number;
  rows: number;
}

function getRowOffset({ containerRef, deltaY, rows }: GetRowOffsetOptions) {
  const containerRect = containerRef.current?.getBoundingClientRect();

  if (!containerRect || containerRect.height <= 0 || rows <= 0) {
    return 0;
  }

  return calculateRowOffset({
    deltaY,
    containerHeight: containerRect.height,
    rows,
  });
}

function useEvent(event: EventDisplayItem["event"]) {
  const { containerRef, view } = useContainer();

  const eventRef = React.useRef(event);

  const eventInFormAtom = React.useMemo(
    () => getEventInForm(event.id),
    [event.id],
  );

  const eventInForm = useAtomValue(eventInFormAtom);

  const setDraggingEventId = useSetDraggingEventId();

  const updateAction = usePartialUpdateAction();

  const moveEvent = React.useCallback(
    (deltaY: number, columnOffset: number) => {
      const event = eventRef.current;
      // @ts-expect-error -- should both be of the same type
      const duration = event.start.until(event.end);

      if (!view.rows) {
        return;
      }

      const rowOffset = getRowOffset({ containerRef, deltaY, rows: view.rows });

      const start = event.start.add({
        days: columnOffset + rowOffset * 7,
      });

      updateAction({
        // @ts-expect-error -- should both be of the same type
        changes: {
          id: event.id,
          start,
          end: start.add(duration),
          type: event.type,
        },
      });
    },
    [updateAction, view.rows, containerRef],
  );

  const setIsDragging = React.useCallback(
    (isDragging: boolean) => {
      setDraggingEventId(isDragging ? event.id : null);
    },
    [event.id, setDraggingEventId],
  );

  React.useEffect(() => {
    eventRef.current = eventInForm ?? event;
  }, [event, eventInForm]);

  return { setIsDragging, moveEvent };
}

interface DraggableMonthEventProps {
  item: EventDisplayItem;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  zIndex?: number;
}

export function DraggableMonthEvent({
  item,
  isFirstDay = true,
  isLastDay = true,
  zIndex,
}: DraggableMonthEventProps) {
  "use memo";

  const {
    containerRef,
    view: { columns },
  } = useContainer();

  const { setIsDragging, moveEvent } = useEvent(item.event);

  const originX = useMotionValue(0);
  const originY = useMotionValue(0);
  const relativeX = useMotionValue(0);
  const relativeY = useMotionValue(0);

  const left = useTransform(() => relativeX.get() - originX.get());
  const top = useTransform(() => relativeY.get() - originY.get());

  const transform = useMotionTemplate`translate(${left}px,${top}px)`;

  const onDragStart = (e: PointerEvent, info: PanInfo) => {
    e.preventDefault();

    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    originX.set(info.point.x - info.offset.x - rect.left);
    originY.set(info.point.y - info.offset.y - rect.top);

    setIsDragging(true);
  };

  const onDrag = (_e: PointerEvent, info: PanInfo) => {
    if (!containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();

    relativeX.set(info.point.x - rect.left);
    relativeY.set(info.point.y - rect.top);
  };

  const onDragEnd = (_e: PointerEvent, info: PanInfo) => {
    setIsDragging(false);

    const columnOffset = getColumnOffset({ containerRef, info, columns });
    const deltaY = relativeY.get() - originY.get();

    originX.set(0);
    originY.set(0);
    relativeX.set(0);
    relativeY.set(0);

    moveEvent(deltaY, columnOffset);
  };

  React.useLayoutEffect(() => {
    originX.set(0);
    originY.set(0);
    relativeX.set(0);
    relativeY.set(0);
  }, [
    originX,
    originY,
    relativeX,
    relativeY,
    // item.event.start,
    // item.event.end,
  ]);

  return (
    <motion.div className="size-full touch-none" style={{ transform, zIndex }}>
      <EventContextMenu event={item.event}>
        <ContextMenuTrigger>
          <MonthEventItem
            item={item}
            isFirstDay={isFirstDay}
            isLastDay={isLastDay}
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
          </MonthEventItem>
        </ContextMenuTrigger>
      </EventContextMenu>
    </motion.div>
  );
}
