"use client";

import { useState } from "react";
import { useCalendarContextOptional } from "@/contexts/calendar-context";
import {
  CalendarDndProvider,
  CalendarEvent,
  CalendarView,
  EventDialog,
  EventGap,
  EventHeight,
  useCalendarNavigation,
  useEventDialog,
  useEventOperations,
  useKeyboardShortcuts,
  WeekCellsHeight,
} from "@/components/event-calendar";
import { CalendarHeader } from "./calendar-header";
import { CalendarContent } from "./calendar-content";
import { cn } from "@/lib/utils";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
  initialView?: CalendarView;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "week",
}: EventCalendarProps) {
  // Unified state management - use context if available, otherwise local state
  const context = useCalendarContextOptional();
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [localView, setLocalView] = useState<CalendarView>(initialView);

  const currentDate = context?.currentDate ?? localCurrentDate;
  const setCurrentDate = context?.setCurrentDate ?? setLocalCurrentDate;
  const view = context?.view ?? localView;
  const setView = context?.setView ?? setLocalView;

  const {
    isEventDialogOpen,
    selectedEvent,
    handleEventSelect,
    handleEventCreate,
    handleDialogClose,
  } = useEventDialog();

  const { handlePrevious, handleNext, handleToday } = useCalendarNavigation({
    currentDate,
    setCurrentDate,
    view,
  });

  const { handleEventSave, handleEventDelete, handleEventMove } =
    useEventOperations({
      events,
      onEventAdd,
      onEventUpdate,
      onEventDelete,
      onDialogClose: handleDialogClose,
    });

  useKeyboardShortcuts({
    setView,
    isEventDialogOpen,
  });

  return (
    <div
      className={cn(
        "flex flex-col has-data-[slot=month-view]:flex-1 overflow-scroll",
        className
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
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
        />

        <div className="grow overflow-scroll">
          <CalendarContent
            view={view}
            currentDate={currentDate}
            events={events}
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
