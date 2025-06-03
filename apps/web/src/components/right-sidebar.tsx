import * as React from "react";

import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function RightSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarRail />
      <SidebarHeader>
        <Input placeholder="Event name" />
      </SidebarHeader>
      <SidebarContent></SidebarContent>
    </Sidebar>
  );
}
