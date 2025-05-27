"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CalendarProvider } from "@/contexts/calendar-context";
import { CalendarView } from "./calendar-view";

export function CalendarLayout() {
  return (
    <CalendarProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset className="overflow-hidden">
          <CalendarView className="grow" />
        </SidebarInset>
      </SidebarProvider>
    </CalendarProvider>
  );
}
