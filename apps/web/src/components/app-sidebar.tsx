import * as React from "react";

import { Calendars } from "@/components/calendars";
import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="relative overflow-hidden">
        <DatePicker />
        <TooltipProvider>
          <Calendars />
        </TooltipProvider>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      {/* <SidebarRail enableDrag={false} /> */}
    </Sidebar>
  );
}
