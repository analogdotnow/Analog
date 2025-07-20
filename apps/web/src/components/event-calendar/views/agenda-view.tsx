"use client";

import * as React from "react";
import { RiCalendarEventLine } from "@remixicon/react";
import { format } from "date-fns";
import { Temporal } from "temporal-polyfill";

import { isToday } from "@repo/temporal/v2";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import {
  AgendaDaysToShow,
  CalendarEvent,
  EventItem,
} from "@/components/event-calendar";
import { type EventCollectionItem } from "@/components/event-calendar/hooks/event-collection";
import type { Action } from "@/components/event-calendar/hooks/use-optimistic-events";
import { getAllEventsForDay } from "@/components/event-calendar/utils";

interface AgendaViewProps {
  currentDate: Temporal.PlainDate;
  events: EventCollectionItem[];
  dispatchAction: (action: Action) => void;
}

export function AgendaView({
  currentDate,
  events,
  dispatchAction,
}: AgendaViewProps) {
  // Show events for the next days based on constant
  const days = React.useMemo(() => {
    return Array.from({ length: AgendaDaysToShow }, (_, i) =>
      currentDate.add({ days: i }),
    );
  }, [currentDate]);

  const handleEventClick = React.useCallback(
    (event: CalendarEvent, e: React.MouseEvent) => {
      e.stopPropagation();
      dispatchAction({ type: "select", event });
    },
    [dispatchAction],
  );

  const settings = useCalendarSettings();

  // Check if there are any days with events
  const hasEvents = days.some((day) => {
    return getAllEventsForDay(events, day, settings.defaultTimeZone).length > 0;
  });

  return (
    <div className="border-t border-border/70 px-4">
      {!hasEvents ? (
        <div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
          <RiCalendarEventLine
            size={32}
            className="mb-2 text-muted-foreground/50"
          />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground">
            There are no events scheduled for this time period.
          </p>
        </div>
      ) : (
        days.map((day) => {
          const dayEventItems = getAllEventsForDay(
            events,
            day,
            settings.defaultTimeZone,
          );

          if (dayEventItems.length === 0) return null;

          return (
            <div
              key={day.toString()}
              className="relative my-12 border-t border-border/70"
            >
              <span
                className="absolute -top-3 left-0 flex h-6 items-center bg-background pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
                data-today={
                  isToday(day, { timeZone: settings.defaultTimeZone }) ||
                  undefined
                }
              >
                {format(day.toString(), "d MMM, EEEE")}
              </span>
              <div className="mt-6 space-y-2">
                {dayEventItems.map((eventItem) => (
                  <EventItem
                    key={eventItem.event.id}
                    event={eventItem.event}
                    view="agenda"
                    onClick={(e) => handleEventClick(eventItem.event, e)}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
