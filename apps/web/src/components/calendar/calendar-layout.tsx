"use client";

import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { MemoizedCalendarView } from "@/components/calendar/calendar-view";
import { DateProvider } from "@/components/calendar/context/date-provider";
import { ZonedDateTimeProvider } from "@/components/calendar/context/datetime-provider";
import { FlowsProvider } from "@/components/calendar/flows/provider";
import { AppCommandMenu } from "@/components/command-menu/app-command-menu";
import { SidebarInset } from "@/components/ui/sidebar";
import { EventHotkeys } from "@/lib/hotkeys/event-hotkeys";
import { WindowStack } from "../command-bar/command-window";

export function CalendarLayout() {
  return (
    <ZonedDateTimeProvider>
      <DateProvider>
        <FlowsProvider>
          <AppSidebar side="left" className="border-r select-none" />
          <EventHotkeys />
          <SidebarInset className="h-dvh overflow-hidden bg-background select-none mac:bg-background/80">
            <MemoizedCalendarView className="grow" />
          </SidebarInset>
          <AppCommandMenu />
          <WindowStack />
        </FlowsProvider>
      </DateProvider>
    </ZonedDateTimeProvider>
  );
}
