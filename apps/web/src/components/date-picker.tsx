"use client";

import { useEffect, useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useCalendarContext } from "@/contexts/calendar-context";
import { cn } from "@/lib/utils";

export function DatePicker() {
  const { currentDate, setCurrentDate } = useCalendarContext();
  const [displayedMonth, setDisplayedMonth] = useState<Date>(currentDate);

  useEffect(() => {
    setDisplayedMonth(currentDate);
  }, [currentDate]);

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          animate
          mode="single"
          required
          selected={currentDate}
          onSelect={setCurrentDate}
          month={displayedMonth}
          onMonthChange={setDisplayedMonth}
          className={cn("w-full px-0 [&_[role=gridcell]]:w-[33px]")}
          todayClassName="[&>button]:border-1 [&>button]:border-sidebar-primary/30 dark:[&>button]:border-sidebar-primary/80 [&>button]:font-medium hover:opacity-80 aria-selected:[&>button]:border-0 aria-selected:[&>button]:bg-sidebar-primary [&>button]:bg-transparent"
          selectedClassName="[&>button]:bg-sidebar-primary [&>button]:text-sidebar-primary-foreground hover:[&>button]:!bg-sidebar-primary hover:[&>button]:text-sidebar-primary-foreground hover:filter hover:brightness-[0.8] focus:[&>button]:bg-sidebar-primary focus:[&>button]:text-sidebar-primary-foreground"
          dayButtonClassName="dark:hover:bg-sidebar-foreground/15"
          weekClassName="relative z-0 before:-z-10 before:absolute before:content-[''] before:inset-0 before:rounded-md dark:[&:has([aria-selected=true])]:before:bg-sidebar-foreground/10 [&:has([aria-selected=true])]:before:bg-sidebar-foreground/5"
          weekdayClassName="flex-1"
          outsideClassName="aria-selected:opacity-100 aria-selected:bg-transparent"
          navClassName="[&>button]:z-10"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
