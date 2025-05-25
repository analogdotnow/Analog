"use client";

import { useEffect, useState } from "react";
import { useCalendarContextOptional } from "@/contexts/calendar-context";
import { RiCalendarCheckLine } from "@remixicon/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import {
  addHoursToDate,
  AgendaView,
  CalendarDndProvider,
  CalendarEvent,
  CalendarView,
  DayView,
  EventDialog,
  EventGap,
  EventHeight,
  generateEventId,
  KEYBOARD_SHORTCUTS,
  MonthView,
  navigateToNext,
  navigateToPrevious,
  shouldIgnoreKeyboardEvent,
  showEventAddedToast,
  showEventDeletedToast,
  showEventMovedToast,
  showEventUpdatedToast,
  snapTimeToInterval,
  TIME_INTERVALS,
  WeekCellsHeight,
  WeekView,
} from "@/components/event-calendar";
import { CalendarViewTitle } from "./calendar-view-title";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SidebarTrigger } from "@/components/ui/sidebar";

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
  const context = useCalendarContextOptional();
  const [localCurrentDate, setLocalCurrentDate] = useState(new Date());
  const [localView, setLocalView] = useState<CalendarView>(initialView);

  const currentDate = context?.currentDate ?? localCurrentDate;
  const setCurrentDate = context?.setCurrentDate ?? setLocalCurrentDate;
  const view = context?.view ?? localView;
  const setView = context?.setView ?? setLocalView;
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyboardEvent(e, isEventDialogOpen)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case KEYBOARD_SHORTCUTS.MONTH:
          setView("month");
          break;
        case KEYBOARD_SHORTCUTS.WEEK:
          setView("week");
          break;
        case KEYBOARD_SHORTCUTS.DAY:
          setView("day");
          break;
        case KEYBOARD_SHORTCUTS.AGENDA:
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEventDialogOpen, setView]);

  const handlePrevious = () => {
    setCurrentDate(navigateToPrevious(currentDate, view));
  };

  const handleNext = () => {
    setCurrentDate(navigateToNext(currentDate, view));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: Date) => {
    const snappedTime = snapTimeToInterval(startTime);

    const newEvent: CalendarEvent = {
      id: "",
      title: "",
      start: snappedTime,
      end: addHoursToDate(
        snappedTime,
        TIME_INTERVALS.DEFAULT_EVENT_DURATION_HOURS
      ),
      allDay: false,
    };

    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (event.id) {
      onEventUpdate?.(event);
      showEventUpdatedToast(event);
    } else {
      const eventWithId = { ...event, id: generateEventId() };
      onEventAdd?.(eventWithId);
      showEventAddedToast(eventWithId);
    }
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId);
    onEventDelete?.(eventId);
    setIsEventDialogOpen(false);
    setSelectedEvent(null);

    if (deletedEvent) {
      showEventDeletedToast(deletedEvent);
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    onEventUpdate?.(updatedEvent);
    showEventMovedToast(updatedEvent);
  };

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
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <header
          className={cn(
            "flex items-center justify-between p-2 sm:p-4 h-16 gap-2 border-b px-4"
          )}
        >
          <div className="flex items-center gap-1 sm:gap-4">
            <SidebarTrigger className="-ml-1" />
            <CalendarViewTitle
              currentDate={currentDate}
              view={view}
              className="text-sm font-semibold sm:text-lg md:text-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                aria-label="Previous"
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </Button>
            </div>

            <Button
              variant="outline"
              className="aspect-square max-[479px]:p-0!"
              onClick={handleToday}
            >
              <RiCalendarCheckLine
                className="min-[480px]:hidden"
                size={16}
                aria-hidden="true"
              />
              <span className="max-[479px]:sr-only">Today</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                  <span>
                    <span className="min-[480px]:hidden" aria-hidden="true">
                      {view.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-[479px]:sr-only">
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </span>
                  </span>
                  <ChevronDownIcon
                    className="-me-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => setView("month")} disabled>
                  Month <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("week")}>
                  Week <DropdownMenuShortcut>W</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("day")}>
                  Day <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("agenda")} disabled>
                  Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="grow overflow-scroll">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
              onEventCreate={handleEventCreate}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      </CalendarDndProvider>
    </div>
  );
}
