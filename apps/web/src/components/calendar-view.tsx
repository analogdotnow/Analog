"use client";

import * as React from "react";
import { useAtomValue, useSetAtom } from "jotai";

import { activeLayoutAtom } from "@/atoms/active-layout";
import {
  calendarPreferencesAtom,
  getCalendarPreference,
} from "@/atoms/calendar-preferences";
import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { cellHeightAtom } from "@/atoms/cell-height";
import {
  calendarViewAtom,
  currentDateAtom,
  viewPreferencesAtom,
} from "@/atoms/view-preferences";
import { AgendaView } from "@/components/calendar/agenda-view/agenda-view";
import { EventGap, EventHeight } from "@/components/calendar/constants";
import { DayView } from "@/components/calendar/day-view/day-view";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import { MonthView } from "@/components/calendar/month-view/month-view";
import { WeekView } from "@/components/calendar/week-view/week-view";
import { db, mapEventQueryInput } from "@/lib/db";
import { cn } from "@/lib/utils";
import { applyOptimisticActions } from "./calendar/hooks/apply-optimistic-actions";
import { optimisticActionsByEventIdAtom } from "./calendar/hooks/optimistic-actions";
import { useEventsForDisplay } from "./calendar/hooks/use-events";
import { filterPastEvents } from "./calendar/utils/event";

interface CalendarContentProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

function CalendarContent({ scrollContainerRef }: CalendarContentProps) {
  const currentDate = useAtomValue(currentDateAtom);
  const view = useAtomValue(calendarViewAtom);
  const { data } = useEventsForDisplay();

  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);
  const optimisticActions = useAtomValue(optimisticActionsByEventIdAtom);

  const { showPastEvents } = useAtomValue(viewPreferencesAtom);
  const calendarPreferences = useAtomValue(calendarPreferencesAtom);

  React.useEffect(() => {
    db.events.bulkPut(
      data?.events?.map((item) => mapEventQueryInput(item.event)) ?? [],
    );
    db.events.bulkPut(
      Object.values(data?.recurringMasterEvents ?? {}).map((event) =>
        mapEventQueryInput(event),
      ) ?? [],
    );
  }, [data?.events, data?.recurringMasterEvents]);

  const events = React.useMemo(() => {
    const events = applyOptimisticActions({
      items: data?.events ?? [],
      timeZone: defaultTimeZone,
      optimisticActions,
    });

    const pastFiltered = showPastEvents
      ? events
      : filterPastEvents(events, defaultTimeZone);

    return pastFiltered.filter((eventItem) => {
      const preference = getCalendarPreference(
        calendarPreferences,
        eventItem.event.calendar.provider.accountId,
        eventItem.event.calendar.id,
      );

      return !(preference?.hidden === true);
    });
  }, [
    data?.events,
    defaultTimeZone,
    optimisticActions,
    showPastEvents,
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

  return <AgendaView currentDate={currentDate} items={events} />;
}

interface CalendarViewProps {
  className?: string;
}

export function CalendarView({ className }: CalendarViewProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const calendarHeaderRef = React.useRef<HTMLElement | null>(null);

  const cellHeight = useAtomValue(cellHeightAtom);

  const setActiveLayout = useSetAtom(activeLayoutAtom);

  const onFocus = React.useCallback(() => {
    setActiveLayout("calendar");
  }, [setActiveLayout]);

  const calendarViewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      "mousedown",
      (e) => {
        if (!calendarViewRef.current?.contains(e.target as Node)) {
          return;
        }

        setActiveLayout("calendar");
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [setActiveLayout]);

  return (
    <div
      ref={calendarViewRef}
      className={cn(
        "@container/calendar-view relative flex flex-col overflow-auto select-none has-data-[slot=month-view]:flex-1",
        className,
      )}
      onClick={onFocus}
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
    </div>
  );
}
