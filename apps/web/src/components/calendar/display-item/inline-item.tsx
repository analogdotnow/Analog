"use client";

import { motion } from "motion/react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type InlineItemCheckboxProps = React.ComponentProps<typeof Checkbox>;

export function InlineItemCheckbox({
  className,
  ...props
}: InlineItemCheckboxProps) {
  return (
    <Checkbox
      className={cn(
        "pointer-events-auto border-2 border-event bg-event group-hover:border-event-hover group-hover:bg-event-hover",
        className,
      )}
      {...props}
    />
  );
}

type InlineItemTitleProps = React.ComponentProps<"p">;

export function InlineItemTitle({
  children,
  className,
  ...props
}: InlineItemTitleProps) {
  return (
    <p
      className={cn(
        "pointer-events-none truncate text-xs font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

type InlineItemDurationProps = React.ComponentProps<"span">;

export function InlineItemDuration({
  children,
  className,
  ...props
}: InlineItemDurationProps) {
  return (
    <span
      className={cn(
        "pointer-events-none truncate text-2xs font-normal tabular-nums opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

type InlineItemHeaderProps = React.ComponentProps<"div">;

export function InlineItemHeader({
  children,
  className,
  ...props
}: InlineItemHeaderProps) {
  return (
    <div
      className={cn(
        "pointer-events-none relative flex w-full items-stretch gap-x-1.5 font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type InlineItemProps = React.ComponentProps<typeof motion.div>;

export function InlineItem({ children, className, ...props }: InlineItemProps) {
  return (
    <motion.div
      className={cn(
        "group hover:text-event-hover relative mx-0.5 flex h-full overflow-hidden rounded-sm border border-event bg-event px-1 text-left font-medium text-event backdrop-blur-md transition outline-none select-none hover:border-event-hover hover:bg-event-hover focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
