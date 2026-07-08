import { Temporal } from "temporal-polyfill";

import {
  MINUTES_IN_HOUR,
  TOTAL_MINUTES_IN_DAY,
} from "@/components/calendar/constants";

function plainTimeFromMinutes(minutes: number) {
  const hour = Math.floor(minutes / MINUTES_IN_HOUR);
  const minute = Math.floor(minutes % MINUTES_IN_HOUR);

  return Temporal.PlainTime.from({
    hour,
    minute,
  });
}

const SNAP_MINUTES = 15;

interface CalculateRelativeOffsetOptions {
  cursorY: number;
  containerTop: number;
  columnHeight: number;
  initialOffsetY: number;
}

export function calculateRelativeOffset({
  cursorY,
  containerTop,
  columnHeight,
  initialOffsetY,
}: CalculateRelativeOffsetOptions) {
  const relativeOffset = cursorY - containerTop - initialOffsetY;

  if (relativeOffset <= 0) {
    return null;
  }

  if (relativeOffset >= columnHeight) {
    return null;
  }

  return relativeOffset;
}

interface CalculateTimeFromRelativeOffsetOptions {
  relativeOffset: number;
  columnHeight: number;
}

export function calculateTimeFromRelativeOffset({
  relativeOffset,
  columnHeight,
}: CalculateTimeFromRelativeOffsetOptions) {
  const minutes =
    Math.round(
      ((relativeOffset / columnHeight) * TOTAL_MINUTES_IN_DAY) / SNAP_MINUTES,
    ) * SNAP_MINUTES;

  if (minutes > TOTAL_MINUTES_IN_DAY - SNAP_MINUTES) {
    return Temporal.PlainTime.from({ hour: 23, minute: 59 });
  }

  if (minutes < 0) {
    return Temporal.PlainTime.from({ hour: 0, minute: 0 });
  }

  return plainTimeFromMinutes(minutes);
}
