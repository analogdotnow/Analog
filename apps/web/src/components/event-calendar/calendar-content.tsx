"use client";

import { CalendarEvent, CalendarView } from "./types";
import { AgendaView } from "./agenda-view";
import { DayView } from "./day-view";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";

interface CalendarContentProps {
  view: CalendarView;
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onEventCreate: (startTime: Date) => void;
}

export function CalendarContent({
  view,
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: CalendarContentProps) {
  switch (view) {
    case "month":
      return (
        <MonthView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
        />
      );

    case "week":
      return (
        <WeekView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
        />
      );

    case "day":
      return (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventSelect={onEventSelect}
          onEventCreate={onEventCreate}
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
        />
      );
  }
}
