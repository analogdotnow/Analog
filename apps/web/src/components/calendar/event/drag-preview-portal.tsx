"use client";

import * as React from "react";
import { motion, useMotionTemplate, type MotionValue } from "motion/react";
import { createPortal } from "react-dom";

import {
  MonthEventItem,
  WeekEventItem,
} from "@/components/calendar/event/event-item";
import type { EventDisplayItem } from "@/lib/display-item";

interface DragPreviewPortalProps {
  item: EventDisplayItem;
  isAllDayItem: boolean;
  isFirstDay: boolean;
  isLastDay: boolean;
  x: MotionValue<number>;
  y: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
}

export function DragPreviewPortal({
  item,
  isAllDayItem,
  isFirstDay,
  isLastDay,
  x,
  y,
  width,
  height,
}: DragPreviewPortalProps) {
  "use memo";

  const transform = useMotionTemplate`translate(${x}px, ${y}px)`;

  return createPortal(
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-10000"
      style={{
        transform,
        width,
        height,
      }}
    >
      {isAllDayItem ? (
        <MonthEventItem
          item={item}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
        />
      ) : (
        <WeekEventItem
          item={item}
          isFirstDay={isFirstDay}
          isLastDay={isLastDay}
        />
      )}
    </motion.div>,
    document.body,
  );
}
