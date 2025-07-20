import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { createDraftEvent } from "@/lib/utils/calendar";
import { TIME_INTERVALS } from "../constants";
import type { Action } from "./use-optimistic-events";

interface UseDoubleClickToCreateOptions {
  dispatchAction: (action: Action) => void;
  date: Temporal.PlainDate;
  columnRef?: React.RefObject<HTMLDivElement | null>;
}

function timeFromMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = Math.floor(minutes % 60);

  return Temporal.PlainTime.from({
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute)),
  });
}

export function useDoubleClickToCreate({
  dispatchAction,
  date,
  columnRef,
}: UseDoubleClickToCreateOptions) {
  const { defaultTimeZone, defaultStartTime, defaultEventDuration } =
    useCalendarSettings();
  const handleDoubleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!columnRef?.current) {
        const start = date.toZonedDateTime({
          timeZone: defaultTimeZone,
          plainTime: defaultStartTime,
        });
        const end = start.add({ minutes: defaultEventDuration });

        dispatchAction({
          type: "draft",
          event: createDraftEvent({ start, end, allDay: false }),
        });
        return;
      }

      const rect = columnRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const columnHeight = rect.height;

      const minutes = (relativeY / columnHeight) * 1440;
      const snapped =
        Math.floor(
          Math.max(0, Math.min(1440, minutes)) / TIME_INTERVALS.SNAP_TO_MINUTES,
        ) * TIME_INTERVALS.SNAP_TO_MINUTES;

      const startTime = timeFromMinutes(snapped);

      const start = date.toZonedDateTime({
        timeZone: defaultTimeZone,
        plainTime: startTime,
      });
      const end = start.add({ minutes: defaultEventDuration });

      dispatchAction({
        type: "draft",
        event: createDraftEvent({ start, end, allDay: false }),
      });
    },
    [
      columnRef,
      date,
      defaultEventDuration,
      defaultStartTime,
      defaultTimeZone,
      dispatchAction,
    ],
  );

  return { onDoubleClick: handleDoubleClick };
}
