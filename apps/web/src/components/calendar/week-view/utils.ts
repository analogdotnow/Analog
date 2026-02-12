import { Temporal } from "temporal-polyfill";

import {
  MINUTES_IN_HOUR,
  TOTAL_MINUTES_IN_DAY,
} from "@/components/calendar/constants";

interface ComputeTimelineWidthOptions {
  scrollElement: HTMLElement;
}

export function computeTimelineWidth({
  scrollElement,
}: ComputeTimelineWidthOptions) {
  const value = getComputedStyle(scrollElement).getPropertyValue(
    "--timeline-container-width",
  );

  const width = Number.parseFloat(value);

  return Number.isFinite(width) ? width : 0;
}

interface CalculateColumnOffsetOptions {
  scrollLeft: number;
  columnWidth: number;
  cursorX: number;
  timelineWidth: number;
}

export function calculateColumnIndex({
  scrollLeft,
  columnWidth,
  cursorX,
  timelineWidth,
}: CalculateColumnOffsetOptions) {
  if (cursorX < timelineWidth) {
    return null;
  }

  const visibleIndex = Math.floor((cursorX - timelineWidth) / columnWidth);

  const anchorIndex = Math.round((scrollLeft + timelineWidth) / columnWidth);

  return visibleIndex + anchorIndex;
}

interface CalculateDateOptions {
  anchor: Temporal.PlainDate;
  columnIndex: number;
  columns: {
    center: number;
  };
  initialColumnOffset: number;
}

export function calculateDate({
  anchor,
  columnIndex,
  columns,
  initialColumnOffset,
}: CalculateDateOptions) {
  return anchor
    .add({ days: columnIndex - columns.center })
    .subtract({ days: initialColumnOffset });
}

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
