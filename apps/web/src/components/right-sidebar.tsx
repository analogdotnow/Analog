"use client";

import * as React from "react";

import { useSelectedEvent } from "@/atoms/selected-events";
import { EventForm } from "@/components/event-form/event-form";
import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

interface RightSidebarProps extends React.ComponentProps<typeof Sidebar> {
  minSidebarWidth?: string;
}

export function RightSidebar({ minSidebarWidth, ...props }: RightSidebarProps) {
  const selectedEvent = useSelectedEvent();

  return (
    <Sidebar {...props}>
      <SidebarRail minSidebarWidth={minSidebarWidth} />
      <SidebarContent className="pr-0.5">
        {selectedEvent ? <EventForm event={selectedEvent} /> : null}
      </SidebarContent>
    </Sidebar>
  );
}
