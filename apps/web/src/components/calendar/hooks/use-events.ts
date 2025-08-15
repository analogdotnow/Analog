import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import * as R from "remeda";
import { toast } from "sonner";

import { endOfMonth, isBefore, startOfMonth } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { useTRPC } from "@/lib/trpc/client";
import { mapEventsToItems } from "./event-collection";

const TIME_RANGE_DAYS_PAST = 30;
const TIME_RANGE_DAYS_FUTURE = 30;

export function insertIntoSorted<T>(
  array: T[],
  item: T,
  predicate: (value: T, index: number, data: readonly T[]) => boolean,
) {
  const index = R.sortedIndexWith(array, predicate);
  return [...array.slice(0, index), item, ...array.slice(index)];
}

export function useEvents() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { currentDate } = useCalendarState();

  const { defaultTimeZone } = useAtomValue(calendarSettingsAtom);

  const { timeMin, timeMax } = React.useMemo(() => {
    const start = currentDate
      .subtract({
        days: TIME_RANGE_DAYS_PAST,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    const end = currentDate
      .add({
        days: TIME_RANGE_DAYS_FUTURE,
      })
      .toZonedDateTime({
        timeZone: defaultTimeZone,
      });

    return {
      timeMin: startOfMonth(start),
      timeMax: endOfMonth(end),
    };
  }, [defaultTimeZone, currentDate]);

  const eventsQueryKey = React.useMemo(
    () =>
      trpc.events.list.queryOptions({ timeMin, timeMax, defaultTimeZone })
        .queryKey,
    [trpc.events.list, timeMin, timeMax, defaultTimeZone],
  );

  const query = useQuery(
    trpc.events.list.queryOptions({
      timeMin,
      timeMax,
      defaultTimeZone,
    }),
  );

  const events = React.useMemo(() => {
    if (!query.data?.events) {
      return [];
    }

    return mapEventsToItems(query.data.events, defaultTimeZone);
  }, [query.data, defaultTimeZone]);

  const createMutation = useMutation(
    trpc.events.create.mutationOptions({
      onMutate: async (newEvent) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (prev) => {
          if (!prev) {
            return undefined;
          }

          const events = insertIntoSorted(prev.events || [], newEvent, (a) =>
            isBefore(a.start, newEvent.start, { timeZone: defaultTimeZone }),
          );

          return {
            ...prev,
            events,
          };
        });

        return { previousEvents };
      },
      onError: (err, _, context) => {
        toast.error(err.message);

        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.events.update.mutationOptions({
      onMutate: async ({ data, move }) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (prev) => {
          if (!prev) {
            return prev;
          }

          const withoutEvent = prev.events.filter((e) => e.id !== data.id);

          const updatedEvent = {
            ...data,
            ...(move?.destination && {
              accountId: move.destination.accountId,
              calendarId: move.destination.calendarId,
            }),
          };

          const events = insertIntoSorted(withoutEvent, updatedEvent, (a) =>
            isBefore(a.start, data.start, {
              timeZone: defaultTimeZone,
            }),
          );

          return {
            ...prev,
            events,
          };
        });

        return { previousEvents };
      },
      onError: (error, _, context) => {
        toast.error(error.message);

        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.events.delete.mutationOptions({
      onMutate: async ({ eventId }) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            events: prev.events.filter((event) => event.id !== eventId),
          };
        });

        return { previousEvents };
      },
      onError: (error, _, context) => {
        toast.error(error.message);

        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  const moveMutation = useMutation(
    trpc.events.move.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: eventsQueryKey });

        const previousEvents = queryClient.getQueryData(eventsQueryKey);

        queryClient.setQueryData(eventsQueryKey, (prev) => {
          if (!prev) {
            return prev;
          }

          const events = prev.events.map((event) => {
            if (event.id !== input.eventId) return event;

            return {
              ...event,
              accountId: input.destination.accountId,
              calendarId: input.destination.calendarId,
              providerId: "google" as const,
            };
          });

          return {
            ...prev,
            events,
          };
        });

        return { previousEvents };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousEvents) {
          queryClient.setQueryData(eventsQueryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: eventsQueryKey });
      },
    }),
  );

  return {
    events,
    createMutation,
    updateMutation,
    deleteMutation,
    moveMutation,
    eventsQueryKey,
  };
}
