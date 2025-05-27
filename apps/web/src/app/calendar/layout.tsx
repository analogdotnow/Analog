import type { ReactNode } from "react";
import { AppHotkeyProvider } from "@/providers/app-hotkey-provider";
import { CalendarProvider } from "@/contexts/calendar-context";
import { SidebarProvider } from "@/components/ui/sidebar";

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
