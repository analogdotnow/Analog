"use client";

import { useEffect } from "react";
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
import { useCalendars } from "@/hooks/use-calendars";
import { EventHotkeys } from "@/lib/hotkeys/event-hotkeys";
import { useOptimisticEvents } from "./event-calendar/hooks/use-optimistic-events";

export function CalendarLayout() {
  const [, setSettings] = useAtom(calendarSettingsAtom);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      defaultTimeZone,
    }));
  }, [setSettings]);

  return (
    <>
      <AppSidebar variant="inset" side="left" />
      <IsolatedCalendarLayout />
    </>
  );
}

function IsolatedCalendarLayout() {
  const query = useCalendars();

  const { events, selectedEvents, dispatchAction, dispatchAsyncAction } =
    useOptimisticEvents();

  return (
    <>
      <EventHotkeys
        selectedEvent={selectedEvents[0]}
        dispatchAction={dispatchAction}
      />
      <SidebarInset className="h-full overflow-hidden">
        <div className="flex h-[calc(100dvh-1rem)]">
          <CalendarView
            className="grow"
            events={events}
            dispatchAction={dispatchAction}
          />
        </div>
      </SidebarInset>
      <RightSidebar variant="inset" side="right">
        <EventForm
          selectedEvent={selectedEvents[0]}
          dispatchAsyncAction={dispatchAsyncAction}
          defaultCalendar={query.data?.defaultCalendar}
        />
      </RightSidebar>
    </>
  );
}
