"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  variant = "default",
  ...props
}: SeparatorPrimitive.Props & { variant?: "default" | "dashed" }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      data-variant={variant}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch data-[variant=dashed]:border-dashed",
        className,
      )}
      {...props}
    />
  );
}

function SeparatorLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-xs font-medium text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

function SeparatorGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] items-center gap-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Separator, SeparatorLabel, SeparatorGroup };
