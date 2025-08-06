"use client";

import { useEffect, useMemo, useRef } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

import {
  useCalendarSettings,
  useCalendarsVisibility,
  useCellHeight,
  useViewPreferences,
} from "@/atoms";
import {
  CalendarHeader,
  EventGap,
  EventHeight,
} from "@/components/event-calendar";
import type { Action } from "@/components/event-calendar/hooks/use-optimistic-events";
import { filterPastEvents } from "@/components/event-calendar/utils";
import { AgendaView } from "@/components/event-calendar/views/agenda-view";
import { DayView } from "@/components/event-calendar/views/day-view";
import { MonthView } from "@/components/event-calendar/views/month-view";
import { WeekView } from "@/components/event-calendar/views/week-view";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { cn } from "@/lib/utils";
import type { EventCollectionItem } from "./event-calendar/hooks/event-collection";

interface CalendarContentProps {
  events: EventCollectionItem[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  dispatchAction: (action: Action) => void;
}

function CalendarContent({
  events,
  dispatchAction,
  scrollContainerRef,
}: CalendarContentProps) {
  const { currentDate, view } = useCalendarState();

  if (view === "month") {
    return (
      <MonthView
        currentDate={currentDate}
        events={events}
        dispatchAction={dispatchAction}
      />
    );
  }

  if (view === "week") {
    return (
      <WeekView
        currentDate={currentDate}
        events={events}
        dispatchAction={dispatchAction}
        scrollContainerRef={scrollContainerRef}
      />
    );
  }

  if (view === "day") {
    return (
      <DayView
        currentDate={currentDate}
        events={events}
        dispatchAction={dispatchAction}
        scrollContainerRef={scrollContainerRef}
      />
    );
  }

  return (
    <AgendaView
      currentDate={currentDate}
      events={events}
      dispatchAction={dispatchAction}
    />
  );
}

interface CalendarViewProps {
  className?: string;
  events: EventCollectionItem[];
  dispatchAction: (action: Action) => void;
}

export function CalendarView({
  className,
  events,
  dispatchAction,
}: CalendarViewProps) {
  const viewPreferences = useViewPreferences();
  const [calendarVisibility] = useCalendarsVisibility();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const calendarHeaderRef = useRef<HTMLElement | null>(null);

  // Cell height comes from Jotai atom so updates trigger a re-render + CSS update
  const cellHeight = useCellHeight();

  const { defaultTimeZone } = useCalendarSettings();
  const filteredEvents = useMemo(() => {
    // First filter past events
    const pastFiltered = filterPastEvents(
      events,
      viewPreferences.showPastEvents,
      defaultTimeZone,
    );

    // Then filter by calendar visibility - need to check the event.event.calendarId
    return pastFiltered.filter(
      (eventItem) =>
        !calendarVisibility.hiddenCalendars.includes(
          eventItem.event.calendarId,
        ),
    );
  }, [
    events,
    viewPreferences.showPastEvents,
    calendarVisibility.hiddenCalendars,
    defaultTimeZone,
  ]);

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
          "--week-cells-height": `${cellHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarHeader ref={calendarHeaderRef} />

      <div
        className="scrollbar-hidden grow overflow-x-hidden overflow-y-auto"
        ref={scrollContainerRef}
      >
        <CalendarContent
          events={filteredEvents}
          dispatchAction={dispatchAction}
          scrollContainerRef={scrollContainerRef}
        />
      </div>
      {/* <SignalView className="absolute bottom-8 left-1/2 -translate-x-1/2" /> */}
    </div>
  );
}
