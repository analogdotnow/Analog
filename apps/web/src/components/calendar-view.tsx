"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

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
import { MonthView } from "@/components/calendar/month-view/month-view";
import { WeekView } from "@/components/calendar/week-view/week-view";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { db, eventQueryInput } from "@/lib/db";
import { cn } from "@/lib/utils";
import { applyOptimisticActions } from "./calendar/hooks/apply-optimistic-actions";
import { optimisticActionsByEventIdAtom } from "./calendar/hooks/optimistic-actions";
import { useEventsForDisplay } from "./calendar/hooks/use-events";
import { filterPastEvents } from "./calendar/utils/event";

interface CalendarContentProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarContent({ scrollContainerRef }: CalendarContentProps) {
  const { currentDate, view } = useCalendarState();
  const { data } = useEventsForDisplay();

  const defaultTimeZone = useAtomValue(calendarSettingsAtom).defaultTimeZone;
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const viewPreferences = useAtomValue(viewPreferencesAtom);
  const calendarPreferences = useAtomValue(calendarPreferencesAtom);

  React.useEffect(() => {
    db.events.bulkPut(
      data?.events?.map((item) => eventQueryInput(item.event)) ?? [],
    );
  }, [data?.events]);

  const events = React.useMemo(() => {
    const events = applyOptimisticActions({
      items: data?.events ?? [],
      timeZone: defaultTimeZone,
      optimisticActions,
    });

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
    data?.events,
    defaultTimeZone,
    optimisticActions,
    viewPreferences,
    calendarPreferences,
  ]);

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
}

export function CalendarView({ className }: CalendarViewProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const calendarHeaderRef = React.useRef<HTMLElement | null>(null);

  const cellHeight = useAtomValue(cellHeightAtom);

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
        <CalendarContent scrollContainerRef={scrollContainerRef} />
      </div>
      {/* <SignalView className="absolute bottom-8 left-1/2 -translate-x-1/2" /> */}
    </div>
  );
}
