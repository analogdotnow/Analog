import * as React from "react";

import { cn } from "@/lib/utils";

export function FormRow({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-(--grid-event-form) items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FormRowIconProps {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  disabled?: boolean;
}

export function FormRowIcon({
  icon: Icon,
  className,
  disabled,
}: FormRowIconProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid grid-cols-(--grid-event-form) items-start gap-2 pt-2">
      <div className="col-start-1 ps-2">
        <Icon
          className={cn(
            "size-4 text-muted-foreground/60",
            disabled && "opacity-50",
            className,
          )}
        />
      </div>
    </div>
  );
}

export function FormContainer({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-y-1 px-0 py-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}
