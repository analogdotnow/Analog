import * as React from "react";

import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Tasks } from "./tasks/tasks";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="relative overflow-hidden">
        <SidebarGroup className="sticky top-0 px-0">
          <SidebarGroupContent>
            <DatePicker />
          </SidebarGroupContent>
          <SidebarGroup>
            <SidebarGroupLabel>Tasks</SidebarGroupLabel>
            <SidebarGroupContent>
              <Tasks />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
