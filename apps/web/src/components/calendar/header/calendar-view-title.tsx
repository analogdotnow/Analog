"use client";

import { AnimatePresence, Variant, motion } from "motion/react";

import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import {
  useCalendarTitleFull,
  useCalendarTitleShort,
  useCalendarView,
  useCurrentWeekNumber,
  useShowWeekNumbers,
} from "@/store/hooks";

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
  "use memo";

  const full = useCalendarTitleFull();
  const short = useCalendarTitleShort();
  const view = useCalendarView();
  const showWeekNumbers = useShowWeekNumbers();
  const currentDate = useCalendarStore((s) => s.currentDate);

  return (
    <div className="relative h-8 w-full">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="h-8 w-fit px-2 py-0 data-[state=open]:bg-accent-light"
            />
          }
        >
          <AnimatePresence mode="wait">
            <motion.h2
              // key={full}
              className={cn(
                "flex h-8 items-center justify-start gap-2 leading-none",
                className,
              )}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <span
                className="line-clamp-1 @md/header:hidden"
                aria-hidden="true"
              >
                {short}
              </span>
              <span className="line-clamp-1 @max-md/header:hidden">{full}</span>
              {view !== "month" && showWeekNumbers ? <WeekNumber /> : null}
            </motion.h2>
          </AnimatePresence>
        </PopoverTrigger>
        <PopoverContent
          className="w-fit rounded-xl p-2 before:rounded-[calc(var(--radius-xl)-1px)]"
          align="start"
        >
          <DatePicker />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function WeekNumber() {
  const weekNumber = useCurrentWeekNumber();

  if (!weekNumber) {
    return null;
  }

  return (
    <span className="line-clamp-1 text-sm text-muted-foreground">
      W{weekNumber}
    </span>
  );
}
