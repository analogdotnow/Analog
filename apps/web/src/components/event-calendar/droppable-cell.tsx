"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface DroppableCellProps {
  id: string;
  date: Date;
  time?: number; // For week/day views, represents hours (e.g., 9.25 for 9:15)
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function DroppableCellComponent({
  id,
  date,
  time,
  children,
  className,
  onClick,
}: DroppableCellProps) {
  return (
    <div
      onClick={onClick}
      className={cn("flex h-full flex-col gap-0.5", className)}
    >
      {children}
    </div>
  );
}

export const DroppableCell = React.memo(DroppableCellComponent);
