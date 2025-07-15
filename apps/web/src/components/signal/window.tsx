import * as React from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

type WindowProps = React.ComponentProps<typeof motion.div>;

export function Window({ children, className, ...props }: WindowProps) {
  return (
    <motion.div
      className={cn(
        "box-content flex max-h-48 min-h-16 w-full flex-col overflow-hidden rounded-2xl border border-border bg-popover/50 backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type WindowHeaderProps = React.ComponentProps<"div">;

export function WindowHeader({
  children,
  className,
  ...props
}: WindowHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-full items-center border-b border-border px-3 py-2",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type WindowTitleProps = React.ComponentProps<"h3">;

export function WindowTitle({
  children,
  className,
  ...props
}: WindowTitleProps) {
  return (
    <h3
      className={cn(
        "text-xs font-medium text-muted-foreground uppercase",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

type WindowContentProps = React.ComponentProps<"div">;

export function WindowContent({
  children,
  className,
  ...props
}: WindowContentProps) {
  return (
    <div className={cn("grow", className)} {...props}>
      {children}
    </div>
  );
}

type WindowFooterProps = React.ComponentProps<"div">;

export function WindowFooter({
  children,
  className,
  ...props
}: WindowFooterProps) {
  return (
    <div className={cn("flex h-13 items-center px-3", className)} {...props}>
      {children}
    </div>
  );
}
