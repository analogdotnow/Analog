import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isSameDay, isSameTime } from "@repo/temporal";

import { usePartialUpdateAction } from "@/components/calendar/flows/update-event/use-update-action";
import { EventDisplayItem, isInstantEvent } from "@/lib/display-item";
import { useSetDraggingEventId, useSetResizing } from "@/store/hooks";

const SNAP_MINUTES = 15;

interface MoveEventOptions {
  date: Temporal.PlainDate;
  time: Temporal.PlainTime;
}

interface MoveAllDayEventOptions {
  date: Temporal.PlainDate;
}

export function useDraggableEventActions(
  item: EventDisplayItem,
  cellHeight: number,
) {
  const itemRef = React.useRef(item);

  const setIsResizing = useSetResizing();
  const setDraggingEventId = useSetDraggingEventId();

  const updateAction = usePartialUpdateAction();

  const moveEvent = ({ date, time }: MoveEventOptions) => {
    const item = itemRef.current;

    if (item.event.allDay) {
      return;
    }

    if (
      isSameDay(date, item.date.start) &&
      isSameTime(time, item.start.toPlainTime())
    ) {
      return;
    }

    if (isInstantEvent(item)) {
      const duration = item.event.start.until(item.event.end);

      const start = date
        .toZonedDateTime({
          timeZone: item.start.timeZoneId,
          plainTime: time,
        })
        .toInstant();

      updateAction({
        changes: {
          id: item.event.id,
          start,
          end: start.add(duration),
          type: item.event.type,
        },
      });

      return;
    }

    // @ts-expect-error -- should both be of the same type
    const duration = item.event.start.until(item.event.end);

    const start = date.toZonedDateTime({
      timeZone: item.start.timeZoneId,
      plainTime: time,
    });

    updateAction({
      changes: {
        id: item.event.id,
        start,
        end: start.add(duration),
        type: item.event.type,
      },
    });
  };

  const moveAllDayEvent = ({ date }: MoveAllDayEventOptions) => {
    const item = itemRef.current;

    if (!item.event.allDay || isSameDay(date, item.event.start)) {
      return;
    }

    const duration = item.event.start.until(item.event.end);

    updateAction({
      changes: {
        id: item.event.id,
        start: date,
        end: date.add(duration),
        type: item.event.type,
      },
    });
  };

  const setIsDragging = (isDragging: boolean) => {
    setDraggingEventId(isDragging ? item.event.id : null);
  };

  const updateStartTime = (offsetY: number) => {
    const item = itemRef.current;

    if (item.event.allDay) {
      return;
    }

    const minutes = Math.round((offsetY / cellHeight) * 60);

    const start = item.event.start.add({ minutes }).round({
      smallestUnit: "minute",
      roundingIncrement: SNAP_MINUTES,
      roundingMode: "halfExpand",
    });

    updateAction({
      changes: {
        id: item.event.id,
        start,
        end: item.event.end,
        type: item.event.type,
      },
    });
  };

  const updateEndTime = (offsetY: number) => {
    const item = itemRef.current;

    if (item.end instanceof Temporal.PlainDate) {
      return;
    }

    const minutes = Math.round((offsetY / cellHeight) * 60);

    const end = item.end.add({ minutes }).round({
      smallestUnit: "minute",
      roundingIncrement: SNAP_MINUTES,
      roundingMode: "halfExpand",
    });

    updateAction({
      changes: {
        id: item.event.id,
        end,
        type: item.event.type,
      },
    });
  };

  // Moves and resizes are relative to what the calendar shows, which already
  // reflects queued and deferred edits through the overlay.
  React.useLayoutEffect(() => {
    itemRef.current = item;
  }, [item]);

  return {
    setIsDragging,
    setIsResizing,
    moveEvent,
    moveAllDayEvent,
    updateStartTime,
    updateEndTime,
  };
}
