import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { useDefaultCalendar } from "../hooks/use-default-calendar";

type DragPreviewProps = React.ComponentProps<typeof motion.div>;

export function DragPreview({ className, style, ...props }: DragPreviewProps) {
  const defaultCalendar = useDefaultCalendar();

  return (
    <motion.div
      className={cn(
        "absolute inset-[2px] z-1000 rounded-sm bg-event transition-all duration-[10ms]",
        className,
      )}
      style={
        {
          ...style,
          "--calendar-color": defaultCalendar?.color,
        } as React.CSSProperties
      }
      {...props}
    ></motion.div>
  );
}
