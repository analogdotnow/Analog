import * as React from "react";
import { motion } from "motion/react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type WindowProps = React.ComponentProps<typeof motion.div>;

export function Window({ children, className, ...props }: WindowProps) {
  return (
    <motion.div
      className={cn(
        "box-content flex min-h-12 w-full flex-col overflow-hidden rounded-2xl border border-border/20 bg-popover/80 shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/10",
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

type WindowContentProps = React.ComponentProps<typeof ScrollArea>;

export function WindowContent({
  children,
  className,
  ...props
}: WindowContentProps) {
  return (
    <ScrollArea className={cn("grow px-1", className)} scrollFade {...props}>
      {children}
    </ScrollArea>
  );
}

type WindowFooterProps = React.ComponentProps<"div">;

export function WindowFooter({
  children,
  className,
  ...props
}: WindowFooterProps) {
  return (
    <div className={cn("flex h-12 items-center px-3", className)} {...props}>
      {children}
    </div>
  );
}
