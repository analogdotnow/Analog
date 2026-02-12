import * as React from "react";
import { useMotionValue, type PanInfo } from "motion/react";
import { isHotkeyPressed, useHotkeys } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import {
  MINUTES_IN_HOUR,
  TOTAL_MINUTES_IN_DAY,
} from "@/components/calendar/constants";
import { useCreateDraftAction } from "@/hooks/calendar/use-optimistic-mutations";
import { usePointerType } from "@/hooks/use-pointer-type";
import {
  getCalendarStore,
  useCalendarStore,
} from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

interface ZonedDateTimeFromMinutesOptions {
  minutes: number;
  date: Temporal.PlainDate;
  timeZone: string;
}

function zonedDateTimeFromMinutes({
  minutes,
  date,
  timeZone,
}: ZonedDateTimeFromMinutesOptions) {
  const hour = Math.floor(minutes / MINUTES_IN_HOUR);
  const minute = Math.floor(minutes % MINUTES_IN_HOUR);

  return date.toZonedDateTime({
    timeZone,
    plainTime: Temporal.PlainTime.from({
      hour: Math.min(23, Math.max(0, hour)),
      minute: Math.min(59, Math.max(0, minute)),
    }),
  });
}

interface UseDragToCreateOptions {
  date: Temporal.PlainDate;
  columnRef: React.RefObject<HTMLDivElement | null>;
}

export function useDragToCreate({ date, columnRef }: UseDragToCreateOptions) {
  "use memo";

  const timeZone = useDefaultTimeZone();
  const initialMinutes = React.useRef(0);
  const top = useMotionValue<number | undefined>(undefined);
  const height = useMotionValue(0);
  const opacity = useMotionValue(0);
  const isCancelled = React.useRef(false);
  const pointerType = usePointerType();

  const columnHeight = useCalendarStore((s) => s.cellHeight * 24);

  const createDraftAction = useCreateDraftAction();

  // Cancel dragging when Escape is pressed
  useHotkeys(
    "esc",
    () => {
      if (!getCalendarStore().getState().isDragging) {
        return;
      }

      isCancelled.current = true;
      document.body.style.removeProperty("cursor");

      top.set(0);
      height.set(0);
      opacity.set(0);
    },
    { scopes: ["calendar"] },
  );

  const getMinutesFromPosition = React.useCallback(
    (globalY: number) => {
      if (!columnRef.current) {
        return 0;
      }

      const columnRect = columnRef.current.getBoundingClientRect();
      const relativeY = globalY - columnRect.top;

      // Calculate minutes from the top (0 = 00:00, columnHeight = 24:00)
      const minutes = (relativeY / columnHeight) * TOTAL_MINUTES_IN_DAY;

      return Math.max(0, Math.min(TOTAL_MINUTES_IN_DAY, minutes));
    },
    [columnRef, columnHeight],
  );

  const snapPositionFloor = React.useCallback(
    (relativeY: number) => {
      const minutes = Math.max(
        0,
        Math.min(
          TOTAL_MINUTES_IN_DAY,
          (relativeY / columnHeight) * TOTAL_MINUTES_IN_DAY,
        ),
      );

      const snappedMinutes = Math.floor(minutes / 15) * 15;

      return (snappedMinutes / TOTAL_MINUTES_IN_DAY) * columnHeight;
    },
    [columnHeight],
  );

  const snapPositionRound = React.useCallback(
    (relativeY: number) => {
      const minutes = Math.max(
        0,
        Math.min(
          TOTAL_MINUTES_IN_DAY,
          (relativeY / columnHeight) * TOTAL_MINUTES_IN_DAY,
        ),
      );

      const snappedMinutes = Math.round(minutes / 15) * 15;

      return (snappedMinutes / TOTAL_MINUTES_IN_DAY) * columnHeight;
    },
    [columnHeight],
  );

  const onDragStart = (event: PointerEvent, info: PanInfo) => {
    if (!columnRef.current || pointerType === "touch") {
      return;
    }

    if (isHotkeyPressed("esc")) {
      isCancelled.current = true;
      document.body.style.removeProperty("cursor");

      return;
    }

    document.body.style.cursor = "row-resize";
    getCalendarStore().getState().setDragging(true);
    isCancelled.current = false;

    // Prevent the default drag behavior that causes the globe icon
    event.preventDefault();

    const columnRect = columnRef.current.getBoundingClientRect();
    const relativeY = info.point.y - columnRect.top;

    initialMinutes.current = getMinutesFromPosition(info.point.y);

    const snappedTop = snapPositionFloor(relativeY);

    top.set(snappedTop);
    opacity.set(1);
    // height.set(0);
  };

  const onDrag = (event: PointerEvent, info: PanInfo) => {
    if (!columnRef.current || pointerType === "touch") {
      return;
    }

    if (!getCalendarStore().getState().isDragging || isCancelled.current) {
      return;
    }

    // Ensure onDragStart has been called first to prevent flickering
    if (top.get() === undefined) {
      return;
    }

    const columnRect = columnRef.current.getBoundingClientRect();
    const currentRelativeY = info.point.y - columnRect.top;
    const initialRelativeY =
      (initialMinutes.current / TOTAL_MINUTES_IN_DAY) * columnHeight;

    const snappedCurrentY = snapPositionRound(currentRelativeY);
    const snappedInitialY = snapPositionFloor(initialRelativeY);

    // If the pointer is above the initial position
    if (snappedCurrentY < snappedInitialY) {
      top.set(snappedCurrentY);
      height.set(snappedInitialY - snappedCurrentY);

      return;
    }

    top.set(snappedInitialY);
    height.set(snappedCurrentY - snappedInitialY);
  };

  const onDragEnd = (event: PointerEvent, info: PanInfo) => {
    document.body.style.removeProperty("cursor");

    if (pointerType === "touch") {
      return;
    }

    getCalendarStore().getState().setDragging(false);

    if (isCancelled.current) {
      isCancelled.current = false;

      top.set(0);
      height.set(0);
      opacity.set(0);

      return;
    }

    const currentMinutes = getMinutesFromPosition(info.point.y);

    const start = zonedDateTimeFromMinutes({
      minutes: Math.min(initialMinutes.current, currentMinutes),
      date,
      timeZone,
    }).round({
      smallestUnit: "minute",
      roundingIncrement: 15,
      roundingMode: "floor",
    });

    const end = zonedDateTimeFromMinutes({
      minutes: Math.max(initialMinutes.current, currentMinutes),
      date,
      timeZone,
    }).round({
      smallestUnit: "minute",
      roundingIncrement: 15,
      roundingMode: "halfExpand",
    });

    top.set(0);
    height.set(0);
    opacity.set(0);

    createDraftAction({
      start,
      end,
      allDay: false,
    });
  };

  return { onDragStart, onDrag, onDragEnd, top, height, opacity };
}
