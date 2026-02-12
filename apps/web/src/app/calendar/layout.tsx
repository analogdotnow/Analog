import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHotkeyProvider } from "@/providers/app-hotkey-provider";
import { CalendarStoreProvider } from "@/providers/calendar-store-provider";

import "react-day-picker/style.css";
import "@/styles/date-picker.css";

import { CalendarColorsProvider } from "@/components/calendar/context/calendar-colors-provider";

export default function CalendarLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <CalendarStoreProvider>
      <CalendarColorsProvider>
        <SidebarProvider defaultOpenLeft={false} defaultWidthRight="21.5rem">
          <AppHotkeyProvider>{children}</AppHotkeyProvider>
        </SidebarProvider>
      </CalendarColorsProvider>
    </CalendarStoreProvider>
  );
}
