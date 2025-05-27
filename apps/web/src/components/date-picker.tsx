"use client";

import { useCallback } from "react";

import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useCalendarContext } from "@/contexts/calendar-context";

export function DatePicker() {
  const { currentDate, setCurrentDate } = useCalendarContext();

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setCurrentDate(date);
      }
    },
    [setCurrentDate],
  );

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleDateSelect}
          className="[&_[role=gridcell]]:w-[33px]"
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
