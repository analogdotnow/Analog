import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { createDraftEvent } from "@/lib/utils/calendar";
import { TIME_INTERVALS } from "../constants";
import type { Action } from "./use-optimistic-events";

interface UseDoubleClickToCreateOptions {
  dispatchAction: (action: Action) => void;
  date: Temporal.PlainDate;
  timeZone: string;
  columnRef?: React.RefObject<HTMLDivElement | null>;
  allDay?: boolean;
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
  timeZone,
  columnRef,
  allDay = false,
}: UseDoubleClickToCreateOptions) {
  const handleDoubleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (allDay) {
        const start = date;
        const end = start.add({ days: 1 });

        dispatchAction({
          type: "draft",
          event: createDraftEvent({ start, end, allDay: true }),
        });
        return;
      }

      if (!columnRef?.current) return;

      const rect = columnRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const columnHeight = rect.height;

      const minutes = (relativeY / columnHeight) * 1440;
      const snapped =
        Math.floor(
          Math.max(0, Math.min(1440, minutes)) / TIME_INTERVALS.SNAP_TO_MINUTES,
        ) * TIME_INTERVALS.SNAP_TO_MINUTES;

      const startTime = timeFromMinutes(snapped);
      const endTime = startTime.add({
        hours: TIME_INTERVALS.DEFAULT_EVENT_DURATION_HOURS,
      });

      const start = date.toZonedDateTime({ timeZone, plainTime: startTime });
      const end = date.toZonedDateTime({ timeZone, plainTime: endTime });

      dispatchAction({
        type: "draft",
        event: createDraftEvent({ start, end, allDay: false }),
      });
    },
    [allDay, columnRef, date, timeZone, dispatchAction],
  );

  return { onDoubleClick: handleDoubleClick };
}
