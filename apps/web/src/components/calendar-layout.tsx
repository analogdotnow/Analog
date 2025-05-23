"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CalendarView } from "./calendar-view";

export function CalendarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CalendarView className="grow" />
      </SidebarInset>
    </SidebarProvider>
  );
}
