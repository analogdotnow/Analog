"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { draggingAtom } from "@/atoms/drag-resize-state";
import { DisplayItem } from "@/lib/display-item";
import { cn } from "@/lib/utils";

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
  const draggedItemId = useAtomValue(draggingAtom);

  const isDragging = item.id ? draggedItemId === item.id : false;

  return (
    <div
      className={cn("z-10", isDragging && "z-99999", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
