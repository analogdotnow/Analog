"use client";

import { useEffect, useMemo } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

import { useCalendarsVisibility, useViewPreferences } from "@/atoms";
import {
  CalendarContent,
  CalendarDndProvider,
  CalendarHeader,
  EventGap,
  EventHeight,
  WeekCellsHeight,
} from "@/components/event-calendar";
import {
  useEventDialog,
  useEventOperations,
} from "@/components/event-calendar/hooks";
import {
  filterPastEvents,
  filterVisibleEvents,
} from "@/components/event-calendar/utils";
import { cn } from "@/lib/utils";
import { SignalView } from "./signal/signal-view";

interface CalendarViewProps {
  className?: string;
}

export function CalendarView({ className }: CalendarViewProps) {
  const viewPreferences = useViewPreferences();
  const [calendarVisibility] = useCalendarsVisibility();

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
        <CalendarHeader />

        <div className="grow overflow-auto">
          <CalendarContent
            events={filteredEvents}
            onEventSelect={handleEventSelect}
            onEventCreate={() => console.log("onEventCreate")}
          />
        </div>
      </CalendarDndProvider>
      <SignalView className="absolute bottom-8 left-1/2 -translate-x-1/2" />
    </div>
  );
}
