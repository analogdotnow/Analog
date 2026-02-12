import * as React from "react";

import { DraggableTaskItem } from "@/components/calendar/display-item/draggable-task-item";
import { DisplayItemContainer } from "@/components/calendar/event/display-item-container";
import { DraggableWeekEvent } from "@/components/calendar/event/draggable-week-event";
import { ReadOnlyWeekEvent } from "@/components/calendar/event/read-only-week-event";
import {
  EventDisplayItem,
  InlineDisplayItem,
  TaskDisplayItem,
  isEvent,
  isTask,
} from "@/lib/display-item";

interface WeekViewItemProps {
  item: InlineDisplayItem;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export function WeekViewItem({ item, position }: WeekViewItemProps) {
  "use memo";

  return (
    <DisplayItemContainer
      key={item.id}
      className="absolute z-10"
      item={item}
      style={{
        top: `${position.top}px`,
        left: `${position.left * 100}%`,
        width: `${position.width * 100}%`,
        height: `${position.height}px`,
      }}
    >
      <WeekViewInlineItem item={item} height={position.height} />
    </DisplayItemContainer>
  );
}

export const MemoizedWeekViewItem = React.memo(WeekViewItem);

interface WeekViewInlineItemProps {
  item: InlineDisplayItem;
  height: number;
}

function WeekViewInlineItem({ item, height }: WeekViewInlineItemProps) {
  "use memo";

  if (isEvent(item)) {
    return <WeekViewEvent item={item} height={height} />;
  }

  if (isTask(item)) {
    return <WeekViewTask item={item} />;
  }

  return null;
}

interface WeekViewTaskProps {
  item: TaskDisplayItem;
}

function WeekViewTask({ item }: WeekViewTaskProps) {
  "use memo";

  return <DraggableTaskItem item={item} view="week" />;
}

interface WeekViewEventProps {
  item: EventDisplayItem;
  height: number;
}

function WeekViewEvent({ item, height }: WeekViewEventProps) {
  "use memo";

  if (item.event.readOnly) {
    return <ReadOnlyWeekEvent item={item} height={height} />;
  }

  return <DraggableWeekEvent item={item} height={height} />;
}
