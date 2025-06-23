import * as React from "react";

import { EventForm } from "@/components/event-form/event-form";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

interface RightSidebarProps extends React.ComponentProps<typeof Sidebar> {
  minSidebarWidth?: string;
}

export function RightSidebar({ minSidebarWidth, ...props }: RightSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarRail minSidebarWidth={minSidebarWidth} />
      <SidebarContent className="pr-0.5">
        <EventForm />
      </SidebarContent>
    </Sidebar>
  );
}
