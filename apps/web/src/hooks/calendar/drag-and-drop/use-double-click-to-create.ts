import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { useCreateDraftAction } from "@/hooks/calendar/use-optimistic-mutations";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultEventDuration, useDefaultTimeZone } from "@/store/hooks";

const TOTAL_MINUTES_IN_DAY = 24 * 60;
const SNAP_TO_MINUTES = 15;

function parsePlainTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = Math.floor(minutes % 60);

  return Temporal.PlainTime.from({
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute)),
  });
}

export function getSnappedMinutesFromY(
  relativeY: number,
  columnHeight: number,
) {
  const minutes = (relativeY / columnHeight) * TOTAL_MINUTES_IN_DAY;

  return (
    Math.floor(
      Math.max(0, Math.min(TOTAL_MINUTES_IN_DAY, minutes)) / SNAP_TO_MINUTES,
    ) * SNAP_TO_MINUTES
  );
}

interface MeasureOffsetOptions {
  date: Temporal.PlainDate;
  relativeY: number;
}

function useMeasureOffset() {
  const defaultTimeZone = useDefaultTimeZone();
  const columnHeight = useCalendarStore((s) => s.cellHeight * 24);

  return React.useCallback(
    (options: MeasureOffsetOptions) => {
      const minutes =
        Math.floor(
          Math.max(
            0,
            Math.min(
              TOTAL_MINUTES_IN_DAY,
              (options.relativeY / columnHeight) * TOTAL_MINUTES_IN_DAY,
            ),
          ) / SNAP_TO_MINUTES,
        ) * SNAP_TO_MINUTES;

      return options.date.toZonedDateTime({
        timeZone: defaultTimeZone,
        plainTime: parsePlainTime(minutes),
      });
    },
    [defaultTimeZone, columnHeight],
  );
}

interface UseWeekDoubleClickToCreateOptions {
  date: Temporal.PlainDate;
  columnRef: React.RefObject<HTMLDivElement | null>;
}

export function useCreateDefaultEventWithOffsetAction({
  date,
  columnRef,
}: UseWeekDoubleClickToCreateOptions) {
  const defaultTimeZone = useDefaultTimeZone();
  const defaultEventDuration = useDefaultEventDuration();

  const columnHeight = useCalendarStore((s) => s.cellHeight * 24);

  const createDraftAction = useCreateDraftAction();

  return React.useCallback(
    (e: React.MouseEvent) => {
      const rect = columnRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const relativeY = e.clientY - rect.top;
      const snappedMinutes = getSnappedMinutesFromY(relativeY, columnHeight);

      const start = date.toZonedDateTime({
        timeZone: defaultTimeZone,
        plainTime: parsePlainTime(snappedMinutes),
      });

      const end = start.add({ minutes: defaultEventDuration });

      createDraftAction({ start, end, allDay: false });
    },
    [
      columnHeight,
      columnRef,
      createDraftAction,
      date,
      defaultEventDuration,
      defaultTimeZone,
    ],
  );
}

type CreateDefaultEventOptions =
  | {
      start: Temporal.PlainDate;
      allDay: true;
    }
  | {
      start: Temporal.ZonedDateTime | Temporal.PlainDate;
      allDay: false;
    };

export function useCreateDefaultEventAction() {
  const defaultTimeZone = useDefaultTimeZone();
  const { defaultStartTime, defaultEventDuration } = useCalendarStore(
    (s) => s.calendarSettings,
  );

  const createDraftAction = useCreateDraftAction();

  return React.useCallback(
    (options: CreateDefaultEventOptions) => {
      if (options.allDay) {
        createDraftAction({
          start: options.start,
          end: options.start.add({ days: 1 }),
          allDay: true,
        });

        return;
      }

      if (options.start instanceof Temporal.ZonedDateTime) {
        createDraftAction({
          start: options.start,
          end: options.start.add({ minutes: defaultEventDuration }),
          allDay: false,
        });

        return;
      }

      const start = options.start.toZonedDateTime({
        timeZone: defaultTimeZone,
        plainTime: defaultStartTime,
      });

      const end = start.add({ minutes: defaultEventDuration });

      createDraftAction({ start, end, allDay: false });
    },
    [
      createDraftAction,
      defaultEventDuration,
      defaultStartTime,
      defaultTimeZone,
    ],
  );
}
