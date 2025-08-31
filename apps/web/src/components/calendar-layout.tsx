"use client";

import * as React from "react";
import { useSetAtom } from "jotai";

import {
  calendarSettingsAtom,
  defaultTimeZone,
} from "@/atoms/calendar-settings";
import { AppSidebar } from "@/components/app-sidebar";
import { CalendarView } from "@/components/calendar-view";
import { EventForm } from "@/components/event-form/event-form";
import { RightSidebar } from "@/components/right-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { EventHotkeys } from "@/lib/hotkeys/event-hotkeys";
import { FlowsProvider } from "./calendar/flows/provider";
import { AppCommandMenu } from "./command-menu/app-command-menu";

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
      <SidebarInset className="h-dvh overflow-hidden bg-background select-none">
        <CalendarView className="grow" />
      </SidebarInset>
      <AppCommandMenu />
      <RightSidebar side="right" className="select-none">
        <EventForm />
      </RightSidebar>
    </FlowsProvider>
  );
}
