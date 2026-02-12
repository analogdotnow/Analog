"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { DraggableTaskItem } from "@/components/calendar/display-item/draggable-task-item";
import { DisplayItemContainer } from "@/components/calendar/event/display-item-container";
import { getGridPosition } from "@/components/calendar/utils/multi-day-layout";
import {
  EventDisplayItem,
  InlineDisplayItem,
  TaskDisplayItem,
  isEvent,
  isTask,
} from "@/lib/display-item";
import { DraggableMonthEvent } from "../event/draggable-month-event";

interface PositionedEventProps {
  item: InlineDisplayItem;
  range: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
  layout: {
    y: number;
  };
}

export function MonthViewItem({ item, range, layout }: PositionedEventProps) {
  "use memo";

  const { colStart, span } = getGridPosition(item, range);

  return (
    <DisplayItemContainer
      key={item.id}
      className="pointer-events-auto my-px min-w-0"
      item={item}
      style={{
        gridColumn: `${colStart + 1} / span ${span}`,
        gridRow: layout.y + 1,
      }}
    >
      <MonthViewInlineItem item={item} week={range} />
    </DisplayItemContainer>
  );
}

interface MonthViewInlineItemProps {
  item: InlineDisplayItem;
  week: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

function MonthViewInlineItem({ item, week }: MonthViewInlineItemProps) {
  "use memo";

  if (isEvent(item)) {
    return <MonthViewEvent item={item} week={week} />;
  }

  if (isTask(item)) {
    return <MonthViewTask item={item} />;
  }

  return null;
}

interface MonthViewEventProps {
  item: EventDisplayItem;
  week: {
    start: Temporal.PlainDate;
    end: Temporal.PlainDate;
  };
}

function MonthViewEvent({ item, week }: MonthViewEventProps) {
  "use memo";

  const isFirstDay = Temporal.PlainDate.compare(item.start, week.start) >= 0;
  const isLastDay = Temporal.PlainDate.compare(item.end, week.end) <= 0;

  return (
    <DraggableMonthEvent
      item={item}
      isFirstDay={isFirstDay}
      isLastDay={isLastDay}
    />
  );
}

interface MonthViewTaskProps {
  item: TaskDisplayItem;
}

function MonthViewTask({ item }: MonthViewTaskProps) {
  "use memo";

  return <DraggableTaskItem item={item} view="month" />;
}

export const MemoizedMonthViewItem = React.memo(MonthViewItem);
