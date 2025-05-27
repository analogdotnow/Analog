"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, subDays } from "date-fns";

import {
  EventCalendar,
  type CalendarEvent,
  type EventColor,
} from "@/components/event-calendar";
import { dateHelpers } from "@/lib/date-helpers";
import { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";

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

const CALENDAR_CONFIG = {
  TIME_RANGE_DAYS_PAST: 30,
  TIME_RANGE_DAYS_FUTURE: 60,
  DEFAULT_CALENDAR_ID: "primary",
};

type Event = RouterOutputs["events"]["list"]["events"][number];

function useCalendarActions() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const timeMin = useMemo(
    () =>
      subDays(new Date(), CALENDAR_CONFIG.TIME_RANGE_DAYS_PAST).toISOString(),
    [],
  );
  const timeMax = useMemo(
    () =>
      addDays(new Date(), CALENDAR_CONFIG.TIME_RANGE_DAYS_FUTURE).toISOString(),
    [],
  );

  const eventsQueryKey = useMemo(
    () => trpc.events.list.queryOptions({ timeMin, timeMax }).queryKey,
    [trpc.events.list, timeMin, timeMax],
  );

  const { data } = useQuery(
    trpc.events.list.queryOptions({
      timeMin,
      timeMax,
    }),
  );

  const transformedEvents = useMemo(() => {
    if (!data?.events) return [];

    return data.events.map((event): CalendarEvent => {
      const startDate = new Date(event.start);
      const endDate = dateHelpers.adjustEndDateForDisplay(
        startDate,
        new Date(event.end),
        event.allDay,
      );

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        start: startDate,
        end: endDate,
        allDay: event.allDay,
        color: event.colorId ? colorMap[event.colorId] || "sky" : "sky",
        location: event.location,
        calendarId: event.calendarId,
      };
    });
  }, [data]);

  const { mutate: createEvent, isPending: isCreating } = useMutation(
    trpc.events.create.mutationOptions({
      onMutate: async (newEvent) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (old) => {
          if (!old) return old;

          const tempEvent: Event = {
            id: `temp-${Date.now()}`,
            title: newEvent.title,
            description: newEvent.description,
            start: newEvent.start,
            end: newEvent.end,
            allDay: newEvent.allDay || false,
            location: newEvent.location,
            colorId: "1",
            status: undefined,
            htmlLink: undefined,
            calendarId: "primary"
          };

          return {
            ...old,
            events: [...(old.events || []), tempEvent].sort(
              (a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime(),
            ),
          };
        });

        return { previousEvents };
      },
      onError: (err, _, context) => {
        // TODO: error message

        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSuccess: () => {},
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  const { mutate: updateEvent, isPending: isUpdating } = useMutation(
    trpc.events.update.mutationOptions({
      onMutate: async (updatedEvent) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            events: old.events
              .map((event) =>
                event.id === updatedEvent.eventId
                  ? {
                      ...event,
                      title: updatedEvent.title ?? event.title,
                      description:
                        updatedEvent.description ?? event.description,
                      start: updatedEvent.start ?? event.start,
                      end: updatedEvent.end ?? event.end,
                      allDay: updatedEvent.allDay ?? event.allDay,
                      location: updatedEvent.location ?? event.location,
                    }
                  : event,
              )
              .sort(
                (a, b) =>
                  new Date(a.start).getTime() - new Date(b.start).getTime(),
              ),
          };
        });

        return { previousEvents };
      },
      onError: (error, _, context) => {
        // TODO: error message

        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSuccess: () => {},
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation(
    trpc.events.delete.mutationOptions({
      onMutate: async ({ eventId }) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            events: old.events.filter((event) => event.id !== eventId),
          };
        });

        return { previousEvents };
      },
      onError: (error, _, context) => {
        // TODO: error message

        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSuccess: () => {},
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  return {
    events: transformedEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    isCreating,
    isUpdating,
    isDeleting,
  };
}

export function CalendarView({ className }: CalendarViewProps) {
  const { events, createEvent, updateEvent, deleteEvent } =
    useCalendarActions();

  const handleEventAdd = (event: CalendarEvent) => {
    createEvent({
      calendarId: CALENDAR_CONFIG.DEFAULT_CALENDAR_ID,
      title: event.title,
      start: dateHelpers.formatDateForAPI(event.start, event.allDay || false),
      end: dateHelpers.formatDateForAPI(event.end, event.allDay || false),
      allDay: event.allDay,
      description: event.description,
      location: event.location,
    });
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    updateEvent({
      calendarId: CALENDAR_CONFIG.DEFAULT_CALENDAR_ID,
      eventId: updatedEvent.id,
      title: updatedEvent.title,
      start: dateHelpers.formatDateForAPI(
        updatedEvent.start,
        updatedEvent.allDay || false,
      ),
      end: dateHelpers.formatDateForAPI(
        updatedEvent.end,
        updatedEvent.allDay || false,
      ),
      allDay: updatedEvent.allDay,
      description: updatedEvent.description,
      location: updatedEvent.location,
    });
  };

  const handleEventDelete = (eventId: string) => {
    deleteEvent({
      calendarId: CALENDAR_CONFIG.DEFAULT_CALENDAR_ID,
      eventId: eventId,
    });
  };

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      className={className}
    />
  );
}
