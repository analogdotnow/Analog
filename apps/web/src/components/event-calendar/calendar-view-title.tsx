"use client";

import { AnimatePresence, Variant, motion } from "motion/react";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { useViewPreferences } from "@/atoms/view-preferences";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { cn } from "@/lib/utils";
import { getViewTitleData } from "./utils";

const variants: Record<string, Variant> = {
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

interface CalendarViewTitleProps {
  className?: string;
}

export function CalendarViewTitle({ className }: CalendarViewTitleProps) {
  const { currentDate, view } = useCalendarState();
  const settings = useCalendarSettings();
  const viewPreferences = useViewPreferences();

  const titleData = getViewTitleData(currentDate, {
    timeZone: settings.defaultTimeZone,
    view,
    weekStartsOn: settings.weekStartsOn,
  });

  return (
    <div className="relative h-8 w-full">
      <AnimatePresence>
        <motion.h2
          key={titleData.full}
          className={cn(
            "absolute inset-0 flex items-center justify-start gap-2 transition-all",
            className,
          )}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <span className="line-clamp-1 @md/header:hidden" aria-hidden="true">
            {titleData.short}
          </span>
          <span className="line-clamp-1 @max-md/header:hidden">
            {titleData.full}
          </span>
          {view !== "month" && viewPreferences.showWeekNumbers ? (
            <span className="line-clamp-1 text-sm text-muted-foreground">
              W{currentDate.weekOfYear}
            </span>
          ) : null}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
