"use client";

import * as React from "react";

import { Sidebar, SidebarContent, SidebarRail } from "@/components/ui/sidebar";

interface RightSidebarProps extends React.ComponentProps<typeof Sidebar> {
  minSidebarWidth?: string;
}

export function RightSidebar({
  children,
  minSidebarWidth,
  ...props
}: RightSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarRail minSidebarWidth={minSidebarWidth} />
      <SidebarContent className="px-1.5 pt-1">{children}</SidebarContent>
    </Sidebar>
  );
}
