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
        "relative grid grid-cols-(--grid-event-form) items-center px-2",
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
}

export function FormRowIcon({ icon: Icon, className }: FormRowIconProps) {
  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-(--grid-event-form) items-start gap-2 pt-2">
      <div className="col-start-1 ps-4">
        <Icon
          className={cn(
            "size-4 text-muted-foreground peer-hover:text-foreground",
            className,
          )}
        />
      </div>
    </div>
  );
}
