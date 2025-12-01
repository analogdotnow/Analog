"use client";

import { useAtomValue } from "jotai";
import { AnimatePresence, Variant, motion } from "motion/react";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import {
  calendarViewAtom,
  currentDateAtom,
  viewPreferencesAtom,
} from "@/atoms/view-preferences";
import { DatePicker } from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getViewTitleData } from "../utils/date-time";

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
  const currentDate = useAtomValue(currentDateAtom);
  const view = useAtomValue(calendarViewAtom);
  const settings = useAtomValue(calendarSettingsAtom);
  const viewPreferences = useAtomValue(viewPreferencesAtom);

  const titleData = getViewTitleData(currentDate, {
    timeZone: settings.defaultTimeZone,
    view,
    weekStartsOn: settings.weekStartsOn,
  });

  return (
    <div className="relative h-8 w-full">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="h-8 w-fit px-2 py-0 data-[state=open]:bg-accent/80"
            />
          }
        >
          <AnimatePresence mode="wait">
            <motion.h2
              key={titleData.full}
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
