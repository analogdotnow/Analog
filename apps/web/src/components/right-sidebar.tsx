import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "./ui/input";

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
