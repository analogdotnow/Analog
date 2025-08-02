import * as React from "react";

import { useCalendarSettings } from "@/atoms/calendar-settings";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const calendarSettings = useCalendarSettings();

  return (
    <Sidebar {...props}>
      <SidebarContent className="relative overflow-hidden">
        <SidebarGroup className="sticky top-0 px-0">
          <SidebarGroupContent>
            <DatePicker />
            {calendarSettings.easterEggsEnabled && <SubwaySurfers />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
