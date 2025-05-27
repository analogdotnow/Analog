"use client";

import { useMemo } from "react";
import { useAtom } from "jotai";
import {
  CalendarDndProvider,
  CalendarEvent,
  EventDialog,
  EventGap,
  EventHeight,
  useEventDialog,
  useEventOperations,
  useKeyboardShortcuts,
  WeekCellsHeight,
  filterPastEvents,
} from "@/components/event-calendar";
import { CalendarHeader } from "./calendar-header";
import { CalendarContent } from "./calendar-content";
import { cn } from "@/lib/utils";
import { viewPreferencesAtom } from "@/atoms";

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
  const [viewPreferences] = useAtom(viewPreferencesAtom);

  const filteredEvents = useMemo(
    () => filterPastEvents(events, viewPreferences.showPastEvents),
    [events, viewPreferences.showPastEvents],
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

  useKeyboardShortcuts({
    isEventDialogOpen,
  });

  return (
    <div
      className={cn(
        "flex flex-col has-data-[slot=month-view]:flex-1 overflow-auto",
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
