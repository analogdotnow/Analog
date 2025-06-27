"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAtomValue } from "jotai";
import { useHotkeysContext } from "react-hotkeys-hook";

import { useCalendarsVisibility, useViewPreferences } from "@/atoms";
import { isDraggingAtom } from "@/atoms/is-dragging";
import {
  CalendarDndProvider,
  CalendarHeader,
  EventGap,
  EventHeight,
  WeekCellsHeight,
} from "@/components/event-calendar";
import { useEdgeAutoScroll } from "@/components/event-calendar/drag-and-drop/use-auto-scroll";
import {
  useEventDialog,
  useEventOperations,
} from "@/components/event-calendar/hooks";
import { CalendarEvent } from "@/components/event-calendar/types";
import {
  filterPastEvents,
  filterVisibleEvents,
} from "@/components/event-calendar/utils";
import { AgendaView } from "@/components/event-calendar/views/agenda-view";
import { DayView } from "@/components/event-calendar/views/day-view";
import { MonthView } from "@/components/event-calendar/views/month-view";
import { WeekView } from "@/components/event-calendar/views/week-view";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { cn } from "@/lib/utils";
import { useScrollToCurrentTime } from "./event-calendar/week-view/use-scroll-to-current-time";

interface CalendarContentProps {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onEventUpdate: (event: CalendarEvent) => void;
  headerRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarContent({
  events,
  onEventSelect,
  onEventCreate,
  onEventUpdate,
  scrollContainerRef,
  headerRef,
}: CalendarContentProps) {
  const { currentDate, view } = useCalendarState();

  const scrollToCurrentTime = useScrollToCurrentTime({ scrollContainerRef });

  useEffect(() => {
    scrollToCurrentTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (view) {
    case "month":
      return (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
          onEventUpdate={onEventUpdate}
        />
      );

    case "week":
      return (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
          onEventUpdate={onEventUpdate}
          headerRef={headerRef}
        />
      );

    case "day":
      return (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
          onEventUpdate={onEventUpdate}
        />
      );

    case "agenda":
      return (
        <AgendaView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
        />
      );

    default:
      // Fallback to week view for unknown view types
      return (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
          onEventUpdate={onEventUpdate}
          headerRef={headerRef}
        />
      );
  }
}

interface CalendarViewProps {
  className?: string;
}

export function CalendarView({ className }: CalendarViewProps) {
  const viewPreferences = useViewPreferences();
  const [calendarVisibility] = useCalendarsVisibility();
  const isDragging = useAtomValue(isDraggingAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Enable edge auto scroll when dragging events
  useEdgeAutoScroll(scrollContainerRef, { active: isDragging, headerRef });

  const { isEventDialogOpen, handleEventSelect, handleDialogClose } =
    useEventDialog();

  const { events, handleEventMove } = useEventOperations(handleDialogClose);

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
        "relative flex flex-col overflow-auto has-data-[slot=month-view]:flex-1",
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
        <CalendarHeader ref={headerRef} />

        <div
          className="scrollbar-hidden grow overflow-x-hidden overflow-y-auto"
          ref={scrollContainerRef}
        >
          <CalendarContent
            events={filteredEvents}
            onEventSelect={handleEventSelect}
            onEventUpdate={handleEventMove}
            onEventCreate={() => console.log("onEventCreate")}
            scrollContainerRef={scrollContainerRef}
            headerRef={headerRef}
          />
        </div>
      </CalendarDndProvider>
      {/* <SignalView className="absolute bottom-8 left-1/2 -translate-x-1/2" /> */}
    </div>
  );
}
