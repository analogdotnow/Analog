"use client";

import * as React from "react";

import { TaskItem } from "@/components/calendar/display-item/task-item";
import { AgendaEventItem } from "@/components/calendar/event/event-item";
import { useSelectAction } from "@/hooks/calendar/use-optimistic-mutations";
import {
  DisplayItem,
  EventDisplayItem,
  InlineDisplayItem,
  TaskDisplayItem,
  isEvent,
  isInlineItem,
  isTask,
} from "@/lib/display-item";

interface AgendaViewItemProps {
  item: DisplayItem;
}

export function AgendaViewItem({ item }: AgendaViewItemProps) {
  "use memo";

  if (!isInlineItem(item)) {
    return null;
  }

  return <AgendaViewInlineItem item={item} />;
}

interface AgendaViewInlineItemProps {
  item: InlineDisplayItem;
}

function AgendaViewInlineItem({ item }: AgendaViewInlineItemProps) {
  "use memo";

  if (isEvent(item)) {
    return <AgendaViewEvent item={item} />;
  }

  if (isTask(item)) {
    return <AgendaViewTask item={item} />;
  }

  return null;
}

interface AgendaViewEventProps {
  item: EventDisplayItem;
}

function AgendaViewEvent({ item }: AgendaViewEventProps) {
  "use memo";

  const selectAction = useSelectAction();

  return (
    <AgendaEventItem
      item={item}
      onClick={(e) => {
        e.stopPropagation();

        selectAction(item.event);
      }}
    />
  );
}

interface AgendaViewTaskProps {
  item: TaskDisplayItem;
}

function AgendaViewTask({ item }: AgendaViewTaskProps) {
  "use memo";

  return <TaskItem item={item} />;
}
