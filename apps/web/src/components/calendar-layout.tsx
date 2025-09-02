"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

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
import { useOptimisticEvents } from "./calendar/hooks/use-optimistic-events";
import { AppCommandMenu } from "./command-menu/app-command-menu";

export function CalendarLayout() {
  const [, setSettings] = useAtom(calendarSettingsAtom);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      defaultTimeZone,
    }));
  }, [setSettings]);

  return (
    <FlowsProvider>
      <AppSidebar variant="inset" side="left" className="select-none" />
      <IsolatedCalendarLayout />
    </FlowsProvider>
  );
}

function IsolatedCalendarLayout() {
  const events = useOptimisticEvents();

  return (
    <>
      <EventHotkeys />
      <SidebarInset className="h-dvh overflow-hidden select-none">
        <div className="flex h-full rounded-xl border border-sidebar-border bg-background">
          <CalendarView className="grow" events={events} />
        </div>
      </SidebarInset>
      <AppCommandMenu />
      <RightSidebar variant="inset" side="right" className="select-none">
        <EventForm />
      </RightSidebar>
    </>
  );
}
