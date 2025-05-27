import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { CalendarProvider } from "@/contexts/calendar-context";
import { AppHotkeyProvider } from "@/providers/app-hotkey-provider";

export default function Layout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <CalendarProvider>
      <SidebarProvider>
        <AppHotkeyProvider> {children}</AppHotkeyProvider>
      </SidebarProvider>
    </CalendarProvider>
  );
}
