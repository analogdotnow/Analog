import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { columnHeightAtom } from "@/atoms/cell-height";
import { createDraftEvent } from "@/lib/utils/calendar";
import { TIME_INTERVALS, TOTAL_MINUTES_IN_DAY } from "../../constants";
import { useCreateDraftAction } from "../use-optimistic-mutations";

interface UseDoubleClickToCreateOptions {
  date: Temporal.PlainDate;
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
  date,
  columnRef,
  allDay = false,
}: UseDoubleClickToCreateOptions) {
  const { defaultTimeZone, defaultStartTime, defaultEventDuration } =
    useAtomValue(calendarSettingsAtom);

  const columnHeight = useAtomValue(columnHeightAtom);

  const createDraftAction = useCreateDraftAction();

  return React.useCallback(
    (e: React.MouseEvent) => {
      if (allDay) {
        const event = createDraftEvent({
          start: date,
          end: date.add({ days: 1 }),
          allDay: true,
        });

        createDraftAction(event);

        return;
      }

      // Month view
      if (!columnRef?.current) {
        const start = date.toZonedDateTime({
          timeZone: defaultTimeZone,
          plainTime: defaultStartTime,
        });

        const end = start.add({ minutes: defaultEventDuration });

        const event = createDraftEvent({ start, end, allDay: false });

        createDraftAction(event);

        return;
      }

      // Day or week view
      const rect = columnRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      const minutes = (relativeY / columnHeight) * TOTAL_MINUTES_IN_DAY;
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

      const event = createDraftEvent({ start, end, allDay: false });

      createDraftAction(event);
    },
    [
      allDay,
      columnHeight,
      columnRef,
      createDraftAction,
      date,
      defaultEventDuration,
      defaultStartTime,
      defaultTimeZone,
    ],
  );
}
