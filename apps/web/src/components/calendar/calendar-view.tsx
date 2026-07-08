"use client";

import * as React from "react";

import { AgendaView } from "@/components/calendar/agenda-view/agenda-view";
import { EVENT_GAP, EVENT_HEIGHT } from "@/components/calendar/constants";
import { MemoizedCalendarHeader } from "@/components/calendar/header/calendar-header";
import { InfiniteWeekViewDayProvider } from "@/components/calendar/week-view/infinite-week-view-day-provider";
import { InfiniteWeekViewProvider } from "@/components/calendar/week-view/infinite-week-view-provider";
import { useProcessedDisplayItems } from "@/hooks/calendar/use-display-items";
import { useEventsForDisplay } from "@/hooks/calendar/use-events";
import { db, mapEventQueryInput } from "@/lib/db";
import { isEvent } from "@/lib/display-item";
import { cn } from "@/lib/utils";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useCellHeight } from "@/store/hooks";
import { InfiniteMonthView } from "./month-view/infinite-month-view";
import { InfiniteMonthViewProvider } from "./month-view/infinite-month-view-provider";
import { InfiniteMonthViewWeekProvider } from "./month-view/infinite-month-view-week-provider";
import { InfiniteWeekView } from "./week-view/infinite-week-view";

function useDisplayItems() {
  "use memo";

  const { data } = useEventsForDisplay();

  React.useEffect(() => {
    db.events.bulkPut(
      data?.events
        ?.filter(isEvent)
        .map((item) => mapEventQueryInput(item.event)) ?? [],
    );
    db.events.bulkPut(
      Object.values(data?.recurringMasterEvents ?? {}).map((event) =>
        mapEventQueryInput(event),
      ) ?? [],
    );
  }, [data?.events, data?.recurringMasterEvents]);

  const items = React.useMemo(() => data?.events ?? [], [data?.events]);

  return useProcessedDisplayItems(items);
}

function CalendarViewContent() {
  "use memo";

  const view = useCalendarStore((s) => s.calendarView);
  const items = useDisplayItems();

  if (view === "agenda") {
    return <AgendaView />;
  }

  if (view === "month") {
    return (
      <InfiniteMonthViewProvider items={items}>
        <InfiniteMonthViewWeekProvider>
          <InfiniteMonthView />
        </InfiniteMonthViewWeekProvider>
      </InfiniteMonthViewProvider>
    );
  }

  return (
    <InfiniteWeekViewProvider items={items}>
      <InfiniteWeekViewDayProvider>
        <InfiniteWeekView />
      </InfiniteWeekViewDayProvider>
    </InfiniteWeekViewProvider>
  );
}

interface CalendarViewProps {
  className?: string;
}

export function CalendarView({ className }: CalendarViewProps) {
  "use memo";

  return (
    <CalendarViewContainer className={className}>
      <MemoizedCalendarHeader />
      <CalendarViewContent />
    </CalendarViewContainer>
  );
}

type CalendarViewContainerProps = React.ComponentProps<"div">;

export function CalendarViewContainer({
  children,
  className,
  ...props
}: CalendarViewContainerProps) {
  "use memo";

  const cellHeight = useCellHeight();

  const { calendarViewRef, onFocus } = useCalendarViewFocus();

  return (
    <div
      className={cn(
        "@container/calendar-view relative flex flex-col overflow-auto select-none has-data-[slot=month-view]:flex-1",
        className,
      )}
      ref={calendarViewRef}
      onClick={onFocus}
      style={{
        "--event-height": `${EVENT_HEIGHT}px`,
        "--event-gap": `${EVENT_GAP}px`,
        "--week-cells-height": `${cellHeight}px`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function useCalendarViewFocus() {
  "use memo";

  const calendarViewRef = React.useRef<HTMLDivElement>(null);

  const setActiveLayout = useCalendarStore((s) => s.setActiveLayout);

  const onFocus = React.useCallback(() => {
    setActiveLayout("calendar");
  }, [setActiveLayout]);

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

  return {
    calendarViewRef,
    onFocus,
  };
}
