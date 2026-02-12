"use client";

import * as React from "react";

import { DisplayItem } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";

interface DisplayItemContainerProps extends React.ComponentProps<"div"> {
  item: DisplayItem;
}

export function DisplayItemContainer({
  className,
  item,
  children,
  style,
  ...props
}: DisplayItemContainerProps) {
  const draggedItemId = useCalendarStore((s) => s.draggingEventId);

  return (
    <div
      className={cn("z-10", draggedItemId === item.id && "z-99999", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
