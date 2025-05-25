"use client";

import {
  CalendarDndProvider,
  CalendarEvent,
  EventDialog,
  EventGap,
  EventHeight,
  useCalendarNavigation,
  useEventDialog,
  useEventOperations,
  useKeyboardShortcuts,
  WeekCellsHeight,
} from "@/components/event-calendar";
import { useCalendarContext } from "@/contexts/calendar-context";
import { CalendarHeader } from "./calendar-header";
import { CalendarContent } from "./calendar-content";
import { cn } from "@/lib/utils";

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
  const { currentDate, setCurrentDate, view, setView } = useCalendarContext();

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
