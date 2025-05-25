"use client";

import {
  CalendarDndProvider,
  CalendarEvent,
  CalendarView,
  EventDialog,
  EventGap,
  EventHeight,
  useCalendarStateManagement,
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
  const {
    currentDate,
    view,
    setView,
    isEventDialogOpen,
    selectedEvent,
    handlePrevious,
    handleNext,
    handleToday,
    handleEventSelect,
    handleEventCreate,
    handleEventSave,
    handleEventDelete,
    handleEventMove,
    handleDialogClose,
  } = useCalendarStateManagement({
    events,
    onEventAdd,
    onEventUpdate,
    onEventDelete,
    initialView,
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
