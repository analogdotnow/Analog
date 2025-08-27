"use client";

import { useMemo, useRef } from "react";
import { useAtom, useAtomValue } from "jotai";

import {
  calendarPreferencesAtom,
  getCalendarPreference,
} from "@/atoms/calendar-preferences";
import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { cellHeightAtom } from "@/atoms/cell-height";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { AgendaView } from "@/components/calendar/agenda-view/agenda-view";
import { EventGap, EventHeight } from "@/components/calendar/constants";
import { DayView } from "@/components/calendar/day-view/day-view";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import type { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { MonthView } from "@/components/calendar/month-view/month-view";
import { filterPastEvents } from "@/components/calendar/utils/event";
import { WeekView } from "@/components/calendar/week-view/week-view";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { cn } from "@/lib/utils";

interface CalendarContentProps {
  events: EventCollectionItem[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarContent({
  events,

  scrollContainerRef,
}: CalendarContentProps) {
  const { currentDate, view } = useCalendarState();

  if (view === "month") {
    return <MonthView currentDate={currentDate} events={events} />;
  }

  if (view === "week") {
    return <WeekView events={events} scrollContainerRef={scrollContainerRef} />;
  }

  if (view === "day") {
    return (
      <DayView
        currentDate={currentDate}
        events={events}
        scrollContainerRef={scrollContainerRef}
      />
    );
  }

  return <AgendaView currentDate={currentDate} events={events} />;
}

interface CalendarViewProps {
  className?: string;
  events: EventCollectionItem[];
}

export function CalendarView({ className, events }: CalendarViewProps) {
  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const [calendarPreferences] = useAtom(calendarPreferencesAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const calendarHeaderRef = useRef<HTMLElement | null>(null);

  const cellHeight = useAtomValue(cellHeightAtom);

  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);
  const filteredEvents = useMemo(() => {
    // First filter past events
    const pastFiltered = filterPastEvents(
      events,
      viewPreferences.showPastEvents,
      defaultTimeZone,
    );

    return pastFiltered.filter((eventItem) => {
      const preference = getCalendarPreference(
        calendarPreferences,
        eventItem.event.accountId,
        eventItem.event.calendarId,
      );

      return !(preference?.hidden === true);
    });
  }, [
    events,
    viewPreferences.showPastEvents,
    calendarPreferences,
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
          scrollContainerRef={scrollContainerRef}
        />
      </div>
      {/* <SignalView className="absolute bottom-8 left-1/2 -translate-x-1/2" /> */}
    </div>
  );
}
