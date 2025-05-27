"use client";

import { useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { useHotkeysContext } from "react-hotkeys-hook";

import { viewPreferencesAtom } from "@/atoms";
import {
  CalendarDndProvider,
  CalendarEvent,
  EventDialog,
  EventGap,
  EventHeight,
  WeekCellsHeight,
  filterPastEvents,
  useEventDialog,
  useEventOperations,
} from "@/components/event-calendar";
import { cn } from "@/lib/utils";
import { CalendarContent } from "./calendar-content";
import { CalendarHeader } from "./calendar-header";

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
