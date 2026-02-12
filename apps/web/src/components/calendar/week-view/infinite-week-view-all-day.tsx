"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { isWeekend } from "@repo/temporal";

import { DraggableTaskItem } from "@/components/calendar/display-item/draggable-task-item";
import { DisplayItemContainer } from "@/components/calendar/event/display-item-container";
import { DraggableWeekEvent } from "@/components/calendar/event/draggable-week-event";
import { ReadOnlyWeekEvent } from "@/components/calendar/event/read-only-week-event";
import { useCreateDefaultEventAction } from "@/hooks/calendar/drag-and-drop/use-double-click-to-create";
import { useUnselectAllAction } from "@/hooks/calendar/use-optimistic-mutations";
import {
  EventDisplayItem,
  InlineDisplayItem,
  TaskDisplayItem,
  isEvent,
  isTask,
} from "@/lib/display-item";
import { cn } from "@/lib/utils";
import {
  useInfiniteWeekViewAllDayEvents,
  type PositionedAllDayItem,
} from "./infinite-week-view-all-day-event-provider";
import {
  useInfiniteWeekViewDays,
  type VisualizedColumns,
} from "./infinite-week-view-day-provider";

export function InfiniteWeekViewAllDaySection() {
  "use memo";

  const { days, columns, range } = useInfiniteWeekViewDays();
  const { items, totalLanes } = useInfiniteWeekViewAllDayEvents();

  const visibleLanes = Math.max(totalLanes, 1);

  return (
    <div className="relative box-border h-fit max-h-64 w-(--week-view-width) flex-1 overflow-y-auto [--calendar-height:100%]">
      <div
        className="relative h-(--all-day-section-height) min-h-7 transition-[height] duration-200 ease-in-out"
        style={{
          "--all-day-section-height": `calc(var(--all-day-row-height) * ${visibleLanes})`,
        }}
      >
        {days.map(({ date, index }) => (
          <MemoizedInfiniteWeekViewAllDayColumn
            key={date.toString()}
            className="absolute top-0 left-(--column-offset) w-(--column-width) [--column-offset:calc(var(--day-offset)*var(--column-width))]"
            day={date}
            index={index}
          />
        ))}
        <div className="pointer-events-none absolute inset-0">
          {items.map((positioned) => (
            <InfiniteWeekViewAllDayItem
              key={positioned.item.id}
              positioned={positioned}
              range={range}
              columns={columns}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface InfiniteWeekViewAllDayColumnProps extends React.ComponentProps<"div"> {
  day: Temporal.PlainDate;
  index: number;
}

function InfiniteWeekViewAllDayColumn({
  className,
  day,
  index,
  ...props
}: InfiniteWeekViewAllDayColumnProps) {
  "use memo";

  const createDefaultEvent = useCreateDefaultEventAction();

  const unselectAllAction = useUnselectAllAction();

  return (
    <div
      data-date={day.toString()}
      className={cn(
        "h-full min-h-7 border-r border-border/70 last:border-r-0",
        isWeekend(day) && "bg-column-weekend",
        className,
      )}
      style={{
        "--day-offset": index,
      }}
      onDoubleClick={() => createDefaultEvent({ start: day, allDay: true })}
      onClick={() => unselectAllAction()}
      {...props}
    />
  );
}

const MemoizedInfiniteWeekViewAllDayColumn = React.memo(
  InfiniteWeekViewAllDayColumn,
);

interface InfiniteWeekViewAllDayItemProps {
  positioned: PositionedAllDayItem;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  columns: VisualizedColumns;
}

function InfiniteWeekViewAllDayItem({
  positioned,
  range,
  columns,
}: InfiniteWeekViewAllDayItemProps) {
  "use memo";

  return (
    <DisplayItemContainer
      item={positioned.item}
      className="pointer-events-auto absolute my-px min-w-0"
      style={{
        top: `calc(var(--all-day-row-height) * ${positioned.lane})`,
        left: `${positioned.startIndex * columns.fraction}%`,
        width: `${positioned.span * columns.fraction}%`,
      }}
    >
      <InfiniteWeekViewAllDayInlineItem item={positioned.item} range={range} />
    </DisplayItemContainer>
  );
}

interface InfiniteWeekViewAllDayInlineItemProps {
  item: InlineDisplayItem;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

function InfiniteWeekViewAllDayInlineItem({
  item,
  range,
}: InfiniteWeekViewAllDayInlineItemProps) {
  "use memo";

  if (isEvent(item)) {
    return <InfiniteWeekViewAllDayEvent item={item} range={range} />;
  }

  if (isTask(item)) {
    return <InfiniteWeekViewAllDayTask item={item} />;
  }

  return null;
}

interface InfiniteWeekViewAllDayTaskProps {
  item: TaskDisplayItem;
}

function InfiniteWeekViewAllDayTask({ item }: InfiniteWeekViewAllDayTaskProps) {
  "use memo";

  return <DraggableTaskItem item={item} view="week" />;
}

interface InfiniteWeekViewAllDayEventProps {
  item: EventDisplayItem;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

function InfiniteWeekViewAllDayEvent({
  item,
  range,
}: InfiniteWeekViewAllDayEventProps) {
  "use memo";

  const isFirstDay = Temporal.PlainDate.compare(item.start, range.start) >= 0;
  const isLastDay = Temporal.PlainDate.compare(item.end, range.end) <= 0;

  if (item.event.readOnly) {
    return (
      <ReadOnlyWeekEvent
        item={item}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
      />
    );
  }

  return (
    <DraggableWeekEvent
      item={item}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
    />
  );
}
