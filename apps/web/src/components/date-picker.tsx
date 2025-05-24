"use client";

import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useCalendarContext } from "@/contexts/calendar-context";

export function DatePicker() {
  const { currentDate, setCurrentDate } = useCalendarContext();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };

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
              "bg-sidebar-primary text-sidebar-primary-foreground hover:!bg-sidebar-primary hover:!text-sidebar-primary-foreground hover:filter hover:brightness-[0.8] focus:bg-sidebar-primary focus:text-sidebar-primary-foreground",
            day_today:
              "border-1 border-accent-foreground/50 bg-transparent font-medium hover:opacity-80 aria-selected:border-0",
          }}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
