"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarView } from "./calendar-view";
import { CalendarProvider } from "@/contexts/calendar-context";

export function CalendarLayout() {
  return (
    <CalendarProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <CalendarView className="grow" />
        </SidebarInset>
      </SidebarProvider>
    </CalendarProvider>
  );
}
