"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Temporal } from "temporal-polyfill";

import { isWeekend } from "@repo/temporal";

import { DragPreview } from "@/components/calendar/event/drag-preview";
import { HOURS } from "@/components/calendar/timeline/constants";
import { TimeIndicator } from "@/components/calendar/timeline/time-indicator";
import { useCreateDefaultEventWithOffsetAction } from "@/hooks/calendar/drag-and-drop/use-double-click-to-create";
import { useDragToCreate } from "@/hooks/calendar/drag-and-drop/use-drag-to-create";
import { cn } from "@/lib/utils";

interface InfiniteWeekViewColumnProps extends React.ComponentProps<"div"> {
  day: Temporal.PlainDate;
}

export function InfiniteWeekViewColumn({
  day,
  className,
  children,
  ...props
}: InfiniteWeekViewColumnProps) {
  "use memo";

  return (
    <div
      data-slot="week-view-day-column"
      className={cn(
        "relative border-r border-border/70 bg-background/20 last:border-r-0",
        isWeekend(day) && "bg-column-weekend",
        className,
      )}
      aria-label={day.toString()}
      {...props}
    >
      {children}

      <TimeIndicator date={day} />
      <InfiniteWeekViewTimeSlots date={day} />
    </div>
  );
}

interface InfiniteWeekViewTimeSlotsProps {
  date: Temporal.PlainDate;
}

function InfiniteWeekViewTimeSlots({ date }: InfiniteWeekViewTimeSlotsProps) {
  "use memo";

  const columnRef = React.useRef<HTMLDivElement>(null);

  const { onDragStart, onDrag, onDragEnd, top, height, opacity } =
    useDragToCreate({
      date,
      columnRef,
    });

  const onDoubleClick = useCreateDefaultEventWithOffsetAction({
    date,
    columnRef,
  });

  return (
    <motion.div
      data-slot="week-view-timed-grid-column"
      className="touch-manipulation select-none"
      ref={columnRef}
      onPanStart={onDragStart}
      onPan={onDrag}
      onPanEnd={onDragEnd}
      onDoubleClick={onDoubleClick}
    >
      <div className="pointer-events-none">
        {HOURS.map((hour) => (
          <div
            key={hour.toString()}
            className="min-h-(--week-cells-height) border-b border-border/70 last:border-b-0"
          />
        ))}
      </div>
      <DragPreview style={{ top, height, opacity }} />
      <div className="pointer-events-none h-(--week-view-bottom-padding)" />
    </motion.div>
  );
}
