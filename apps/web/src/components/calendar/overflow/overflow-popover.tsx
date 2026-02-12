"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import { TaskItem } from "@/components/calendar/display-item/task-item";
import { AgendaEventItem } from "@/components/calendar/event/event-item";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSelectAction } from "@/hooks/calendar/use-optimistic-mutations";
import {
  EventDisplayItem,
  InlineDisplayItem,
  isEvent,
  isTask,
} from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { format } from "@/lib/utils/format";
import { useDefaultTimeZone } from "@/store/hooks";

interface OverflowIndicatorProps {
  items: InlineDisplayItem[];
  date: Temporal.PlainDate;

  gridColumn?: string;
  className?: string;
}

export function OverflowPopover({
  items,
  date,
  gridColumn,
  className,
}: OverflowIndicatorProps) {
  const defaultTimeZone = useDefaultTimeZone();

  if (items.length === 0) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className={cn(
              "pointer-events-auto rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
              className,
            )}
            style={gridColumn ? { gridColumn } : undefined}
          />
        }
      >
        +{items.length} more
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <PopoverTitle className="text-sm font-medium">
            {format(date, "D MMMM YYYY", defaultTimeZone)}
          </PopoverTitle>
          <PopoverClose
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-full p-1 hover:bg-muted",
            )}
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </PopoverClose>
        </div>
        <OverflowList items={items} />
      </PopoverContent>
    </Popover>
  );
}

interface OverflowListProps {
  items: InlineDisplayItem[];
}

function OverflowList({ items }: OverflowListProps) {
  return (
    <div className="max-h-96 space-y-2 overflow-auto px-2 pb-2">
      {items.map((item) => (
        <OverflowItem key={item.id} item={item} />
      ))}
    </div>
  );
}

interface OverflowItemProps {
  item: InlineDisplayItem;
}

function OverflowItem({ item }: OverflowItemProps) {
  if (isEvent(item)) {
    return <OverflowListEvent item={item} />;
  }

  if (isTask(item)) {
    return <TaskItem item={item} />;
  }

  return null;
}

function OverflowListEvent({ item }: { item: EventDisplayItem }) {
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
