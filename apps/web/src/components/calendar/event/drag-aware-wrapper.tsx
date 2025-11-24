"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { draggingAtom } from "@/atoms/drag-resize-state";
import { cn } from "@/lib/utils";

interface DragAwareWrapperProps extends React.ComponentProps<"div"> {
  eventId: string;
}

// TODO: replace with a portal
export function DragAwareWrapper({
  className,
  eventId,
  children,
  style,
  ...props
}: DragAwareWrapperProps) {
  const draggedEventId = useAtomValue(draggingAtom);
  const isDragging = draggedEventId === eventId;

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
