"use client";

import * as React from "react";
import { useSetAtom } from "jotai";

import {
  calendarSettingsAtom,
  defaultTimeZone,
} from "@/atoms/calendar-settings";
import { AppSidebar } from "@/components/app-sidebar";
import { CalendarView } from "@/components/calendar-view";
import { FlowsProvider } from "@/components/calendar/flows/provider";
import { AppCommandMenu } from "@/components/command-menu/app-command-menu";
import { EventForm } from "@/components/event-form/event-form";
import { RightSidebar } from "@/components/right-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { EventHotkeys } from "@/lib/hotkeys/event-hotkeys";
import { ResponsiveView } from "./responsive-view";

export function CalendarLayout() {
  const setSettings = useSetAtom(calendarSettingsAtom);

  React.useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      defaultTimeZone,
    }));
  }, [setSettings]);

  return (
    <FlowsProvider>
      <AppSidebar side="left" className="select-none" />
      <EventHotkeys />
      <SidebarInset className="h-dvh overflow-hidden bg-background select-none mac:bg-background/80">
        <CalendarView className="grow" />
      </SidebarInset>
      <AppCommandMenu />
      <ResponsiveView>
        <EventForm />
      </ResponsiveView>
    </FlowsProvider>
  );
}
