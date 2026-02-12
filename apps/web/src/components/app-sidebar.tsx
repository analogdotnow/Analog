"use client";

import * as React from "react";

import { DatePicker } from "@/components/date-picker";
import { SubwaySurfers } from "@/components/easter-eggs/subway-surfers";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useCalendarStore } from "@/providers/calendar-store-provider";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export function AppSidebar(props: AppSidebarProps) {
  "use memo";

  const easterEggsEnabled = useCalendarStore(
    (s) => s.calendarSettings.easterEggsEnabled,
  );

  return (
    <Sidebar {...props}>
      <SidebarContent className="relative gap-0 overflow-hidden">
        <div className="hidden h-12 titlebar-draggable mac:block" />
        <SidebarGroup className="pt-3.75">
          <SidebarGroupContent className="items-center px-1.5">
            <DatePicker />
            {easterEggsEnabled && <SubwaySurfers />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
