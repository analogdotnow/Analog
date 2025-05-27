"use client";

import { useEffect, useMemo } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

import {
  CalendarDndProvider,
  CalendarEvent,
  EventDialog,
  EventGap,
  EventHeight,
  WeekCellsHeight,
  filterPastEvents,
  filterVisibleEvents,
  useEventDialog,
  useEventOperations,
} from "@/components/event-calendar";
import { cn } from "@/lib/utils";
import { CalendarContent } from "./calendar-content";
import { CalendarHeader } from "./calendar-header";
import { useCalendarsVisibility, useViewPreferences } from "./hooks";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
}: EventCalendarProps) {
  const viewPreferences = useViewPreferences();
  const [calendarVisibility] = useCalendarsVisibility();

  const filteredEvents = useMemo(
    () =>
      filterVisibleEvents(
        filterPastEvents(events, viewPreferences.showPastEvents),
        calendarVisibility.hiddenCalendars,
      ),
    [
      events,
      viewPreferences.showPastEvents,
      calendarVisibility.hiddenCalendars,
    ],
  );

  const {
    isEventDialogOpen,
    selectedEvent,
    handleEventSelect,
    handleEventCreate,
    handleDialogClose,
  } = useEventDialog();

  const { handleEventSave, handleEventDelete, handleEventMove } =
    useEventOperations({
      events: filteredEvents,
      onEventAdd,
      onEventUpdate,
      onEventDelete,
      onOperationComplete: handleDialogClose,
    });

  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (isEventDialogOpen) {
      disableScope("calendar");
    } else {
      enableScope("calendar");
    }
  }, [isEventDialogOpen, enableScope, disableScope]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-auto has-data-[slot=month-view]:flex-1",
        className,
      )}
      style={
        {
          "--event-height": `${EventHeight}px`,
          "--event-gap": `${EventGap}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventMove}>
        <CalendarHeader />

        <div className="grow overflow-auto">
          <CalendarContent
            events={filteredEvents}
            onEventSelect={handleEventSelect}
            onEventCreate={handleEventCreate}
          />
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={handleDialogClose}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  );
}
