"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Temporal } from "temporal-polyfill";

import { isWeekend } from "@repo/temporal";

import { DragPreview } from "@/components/calendar/event/drag-preview";
import { HOURS } from "@/components/calendar/timeline/constants";
import { TimeIndicator } from "@/components/calendar/timeline/time-indicator";
import type { PositionedDisplayItem } from "@/components/calendar/utils/positioning/inline-items";
import type { PositionedSideItem } from "@/components/calendar/utils/positioning/side-items";
import { useCreateDefaultEventWithOffsetAction } from "@/hooks/calendar/drag-and-drop/use-double-click-to-create";
import { useDragToCreate } from "@/hooks/calendar/drag-and-drop/use-drag-to-create";
import { cn } from "@/lib/utils";
import { MemoizedWeekViewItem } from "./week-view-item";
import { WeekViewSideItem } from "./week-view-side-item";

interface InfiniteWeekViewColumnProps extends React.ComponentProps<"div"> {
  day: Temporal.PlainDate;
  index: number;
  items: PositionedDisplayItem[];
  sideItems: PositionedSideItem[];
}

export function InfiniteWeekViewColumn({
  day,
  className,
  index,
  items,
  sideItems,
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
      style={{
        "--day-offset": index,
      }}
      {...props}
    >
      {sideItems.map(({ item, position }) => (
        <WeekViewSideItem key={item.id} item={item} position={position} />
      ))}

      {items.map(({ item, position }) => (
        <MemoizedWeekViewItem key={item.id} item={item} position={position} />
      ))}

      <TimeIndicator date={day} />
      <MemoizedInfiniteWeekViewTimeSlots date={day} />
    </div>
  );
}

export const MemoizedInfiniteWeekViewColumn = React.memo(
  InfiniteWeekViewColumn,
);

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
      <div>
        {HOURS.map((hour) => (
          <div
            key={hour.toString()}
            className="pointer-events-none min-h-(--week-cells-height) border-b border-border/70 last:border-b-0"
          />
        ))}
      </div>
      <DragPreview style={{ top, height, opacity }} />
      <div className="pointer-events-none h-(--week-view-bottom-padding)" />
    </motion.div>
  );
}

const MemoizedInfiniteWeekViewTimeSlots = React.memo(InfiniteWeekViewTimeSlots);
