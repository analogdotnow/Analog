"use client";

import { AnimatePresence, Variant, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { CalendarView } from "./types";
import { getViewTitleData, getViewTitleDirection } from "./utils";

interface CalendarViewTitleProps {
  currentDate: Date;
  view: CalendarView;
  className?: string;
  prevDate?: Date;
}

/**
 * Component that renders the calendar view title with responsive breakpoints
 */

export function CalendarViewTitle(props: CalendarViewTitleProps) {
  const { currentDate, view, className } = props;
  const titleData = getViewTitleData(currentDate, view);

  if (view === "day") {
    return (
      <motion.h2
        className={className}
        key={titleData.full}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <span className="min-[480px]:hidden" aria-hidden="true">
          {titleData.short}
        </span>
        <span className="max-[479px]:hidden min-md:hidden" aria-hidden="true">
          {titleData.medium}
        </span>
        <span className="max-md:hidden">{titleData.full}</span>
      </motion.h2>
    );
  }

  return <BaseViewTitle {...props} />;
}
const OFF_SET = 10;
const baseViewVariant: Record<string, Variant> = {
  exit: (dir: "top" | "bottom") => ({
    opacity: 0,
    filter: "blur(10px)",
    y: dir === "top" ? -OFF_SET : OFF_SET,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
  initial: (dir: "top" | "bottom") => ({
    opacity: 0,
    filter: "blur(10px)",
    y: dir === "top" ? OFF_SET : -OFF_SET,
  }),
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

function BaseViewTitle({
  currentDate,
  className,
  view,
  prevDate,
}: CalendarViewTitleProps) {
  const titleData = getViewTitleData(currentDate, view);
  const dir = getViewTitleDirection(currentDate, prevDate);
  return (
    <div className="relative h-8 w-full">
      <AnimatePresence>
        <motion.h2
          custom={dir}
          key={titleData.full}
          className={cn(
            "absolute inset-0 flex items-center justify-start transition-all",
            className,
          )}
          variants={baseViewVariant}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <span className="md:hidden" aria-hidden="true">
            {titleData.short}
          </span>
          <span className="max-md:hidden">{titleData.full}</span>
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
