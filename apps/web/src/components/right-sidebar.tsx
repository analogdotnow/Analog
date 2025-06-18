import * as React from "react";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import EventForm from "./event-form";

export function RightSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="items-center">
        <div className="w-full max-w-[22rem] shrink-0 pr-1.5 pl-0.5">
          <EventForm />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
