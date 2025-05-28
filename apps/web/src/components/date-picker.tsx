"use client";

import { useCallback, useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useCalendarContext } from "@/contexts/calendar-context";
import { cn } from "@/lib/utils";

export function DatePicker() {
  const { currentDate, setCurrentDate } = useCalendarContext();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [displayedDate, setDisplayedDate] = useState<Date | undefined>(
    undefined,
  );
  const [displayedMonth, setDisplayedMonth] = useState(currentDate);

  const handleMonthChange = useCallback(
    (month: Date) => {
      setDisplayedDate(undefined);
      setTimeout(() => {
        setDisplayedMonth(month);
        setCurrentDate(month);
      }, 50);
    },
    [setCurrentDate, setDisplayedMonth],
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setShouldAnimate(true);
        setCurrentDate(date);
        setTimeout(() => {
          setDisplayedMonth(date);
          setShouldAnimate(false);
        }, 800);
      }
    },
    [setCurrentDate],
  );

  // we need to be able to set undefined date to avoid buggy jumps
  // with react-day-picker, but date cannot be undefined in the context
  // therefore the need for a mirror state
  useEffect(() => {
    setDisplayedDate(currentDate);
  }, [currentDate]);

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={displayedDate}
          onSelect={handleDateSelect}
          month={displayedMonth}
          onMonthChange={handleMonthChange}
          className={cn(
            "[&_[role=gridcell]]:w-[33px]",
            shouldAnimate &&
              "[&_[role=gridcell]]:transition-colors [&_[role=gridcell]]:duration-700",
          )}
          classNames={{
            day_selected:
              "!bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground hover:filter hover:brightness-[0.8] focus:!bg-sidebar-primary focus:!text-sidebar-primary-foreground",
            day_today:
              "!border-1 !border-sidebar-primary/30 dark:!border-sidebar-primary/70 font-medium hover:opacity-80 aria-selected:!border-0 aria-selected:!bg-sidebar-primary",
          }}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
