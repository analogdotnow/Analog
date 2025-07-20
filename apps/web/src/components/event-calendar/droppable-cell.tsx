"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type DroppableCellProps = React.ComponentProps<"div">;

function DroppableCellComponent({
  children,
  className,
  ...props
}: DroppableCellProps) {
  return (
    <div className={cn("h-full flex-col gap-0.5", className)} {...props}>
      {children}
    </div>
  );
}

export const DroppableCell = React.memo(DroppableCellComponent);
