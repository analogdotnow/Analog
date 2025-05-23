"use client";

import { useState, useMemo } from "react";
import { addDays, subDays, endOfDay } from "date-fns";
import { EventCalendar, type CalendarEvent, type EventColor } from "@/components/event-calendar";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface CalendarViewProps {
  className?: string;
}

const colorMap: Record<string, EventColor> = {
  "1": "sky",
  "2": "emerald",
  "3": "violet",
  "4": "rose",
  "5": "amber",
  "6": "orange",
  "7": "sky",
  "8": "violet",
  "9": "sky",
  "10": "emerald",
  "11": "rose",
};

export function CalendarView({ className }: CalendarViewProps) {
  const trpc = useTRPC();

  const timeMin = useMemo(() => subDays(new Date(), 30).toISOString(), []);
  const timeMax = useMemo(() => addDays(new Date(), 60).toISOString(), []);

  const { data, isLoading, error } = useQuery(
    trpc.calendars.events.queryOptions({
      timeMin,
      timeMax,
    })
  );

  const transformedEvents = useMemo(() => {
    if (!data?.events) return [];

    return data.events.map((event): CalendarEvent => {
      const startDate = new Date(event.start);
      let endDate = new Date(event.end);

      if (event.allDay && endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
        const nextDayOfStart = addDays(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()), 1);
        if (endDate.getTime() === nextDayOfStart.getTime()) {
          endDate = endOfDay(startDate);
        } else {
          endDate = endOfDay(subDays(endDate, 1));
        }
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        start: startDate,
        end: endDate,
        allDay: event.allDay,
        color: event.colorId ? colorMap[event.colorId] || "sky" : "sky",
        location: event.location,
      };
    });
  }, [data]);

  return <EventCalendar events={transformedEvents} className={className} />;
}
