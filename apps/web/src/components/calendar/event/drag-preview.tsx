import * as React from "react";
import { motion } from "motion/react";

import { useDefaultCalendar } from "@/hooks/calendar/use-default-calendar";
import { cn } from "@/lib/utils";

type DragPreviewProps = React.ComponentProps<typeof motion.div>;

export function DragPreview({ className, style, ...props }: DragPreviewProps) {
  const defaultCalendar = useDefaultCalendar();

  return (
    <motion.div
      className={cn(
        "absolute inset-[2px] z-1000 rounded-sm bg-event transition-all duration-10",
        className,
      )}
      style={{
        ...style,
        "--calendar-color": defaultCalendar?.color,
      }}
      {...props}
    />
  );
}
