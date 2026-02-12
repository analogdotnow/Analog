"use client";

import { TaskDisplayItem } from "@/lib/display-item";
import { InlineItem, InlineItemCheckbox, InlineItemTitle } from "./inline-item";

interface TaskDisplayItemProps {
  children?: React.ReactNode;
  item: TaskDisplayItem;
}

export function TaskItem({ children, item }: TaskDisplayItemProps) {
  "use memo";

  return (
    <InlineItem
      className="flex gap-x-1.5 py-1"
      style={{
        "--calendar-color": "var(--color-muted-foreground)",
      }}
    >
      {children}
      <div className="pointer-events-none relative flex w-full items-stretch gap-x-1.5 font-medium">
        <InlineItemCheckbox />
        <InlineItemTitle>{item.value.title ?? "(untitled)"}</InlineItemTitle>
      </div>
    </InlineItem>
  );
}
