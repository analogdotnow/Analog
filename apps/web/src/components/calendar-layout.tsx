"use client";

import { useQuery } from "@tanstack/react-query";

import { AppSidebar } from "@/components/app-sidebar";
import { CalendarView } from "@/components/calendar-view";
import { useEventOperations } from "@/components/event-calendar";
import { EventForm } from "@/components/event-form/event-form";
import { RightSidebar } from "@/components/right-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useTRPC } from "@/lib/trpc/client";

export function CalendarLayout() {
  return (
    <>
      <AppSidebar variant="inset" side="left" />
      <IsolatedCalendarLayout />
    </>
  );
}

function IsolatedCalendarLayout() {
  const trpc = useTRPC();
  const query = useQuery(trpc.calendars.list.queryOptions());

  const {
    events,
    selectedEvents,
    handleEventMove,
    handleEventSelect,
    handleEventSave,
    handleEventCreate,
  } = useEventOperations();

  return (
    <>
      <SidebarInset className="h-full overflow-hidden">
        <div className="flex h-[calc(100dvh-1rem)]">
          <CalendarView
            className="grow"
            events={events}
            handleEventMove={handleEventMove}
            handleEventSelect={handleEventSelect}
            handleEventCreate={handleEventCreate}
          />
        </div>
      </SidebarInset>
      <RightSidebar variant="inset" side="right">
        <EventForm
          selectedEvent={selectedEvents[0]}
          handleEventSave={handleEventSave}
          defaultCalendar={query.data?.defaultCalendar}
        />
      </RightSidebar>
    </>
  );
}
