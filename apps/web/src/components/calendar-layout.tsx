"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { CalendarView } from "./calendar-view";

export function CalendarLayout() {
  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset className="overflow-hidden">
        <CalendarView className="grow" />
      </SidebarInset>
    </>
  );
}
