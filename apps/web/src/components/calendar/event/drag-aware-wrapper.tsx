"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { draggingAtom } from "@/atoms/drag-resize-state";

interface DragAwareWrapperProps extends React.ComponentProps<"div"> {
  eventId: string;
}

// TODO: replace with a portal
export function DragAwareWrapper({
  eventId,
  children,
  style,
  ...props
}: DragAwareWrapperProps) {
  const draggedEventId = useAtomValue(draggingAtom);
  const isDragging = draggedEventId === eventId;

  return (
    <div
      style={{
        ...style,
        zIndex: isDragging ? 99999 : "auto",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
