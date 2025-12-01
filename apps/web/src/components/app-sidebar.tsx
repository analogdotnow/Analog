import * as React from "react";
import { useAtomValue } from "jotai";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
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
  const calendarSettings = useAtomValue(calendarSettingsAtom);

  return (
    <Sidebar {...props}>
      <SidebarContent className="relative gap-0 overflow-hidden">
        <div className="hidden h-12 titlebar-draggable mac:block" />
        <SidebarGroup className="pt-3.75">
          <SidebarGroupContent className="items-center px-1.5">
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
