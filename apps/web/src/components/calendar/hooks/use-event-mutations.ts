import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { isBefore } from "@repo/temporal";

import type { CalendarEvent } from "@/lib/interfaces";
import { insertIntoSorted } from "@/lib/sorted-actions";
import { useTRPC } from "@/lib/trpc/client";
import { useEventQueryParams } from "./use-events";

export function useCreateEventMutation() {
  const trpc = useTRPC();

  const queryClient = useQueryClient();
  const { defaultTimeZone, queryKey } = useEventQueryParams();

  return useMutation(
    trpc.events.create.mutationOptions({
      onMutate: async (newEvent) => {
        await queryClient.cancelQueries({ queryKey });

        const previousEvents = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (prev) => {
          if (!prev) {
            return undefined;
          }

          // Filter out null values for optimistic update
          const cleanedEvent = Object.fromEntries(
            Object.entries(newEvent).filter(([_, v]) => v !== null),
          ) as unknown as CalendarEvent;

          const events = insertIntoSorted(
            prev.events || [],
            cleanedEvent,
            (a) =>
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
          queryClient.setQueryData(queryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );
}

export function useUpdateEventMutation() {
  const trpc = useTRPC();

  const queryClient = useQueryClient();
  const { defaultTimeZone, queryKey } = useEventQueryParams();

  return useMutation(
    trpc.events.update.mutationOptions({
      onMutate: async ({ data, move }) => {
        await queryClient.cancelQueries({ queryKey });

        const previousEvents = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (prev) => {
          if (!prev) {
            return prev;
          }

          const withoutEvent = prev.events.filter((e) => e.id !== data.id);

          const updatedEvent = {
            ...data,
            ...(move?.destination
              ? {
                  accountId: move.destination.accountId,
                  calendarId: move.destination.calendarId,
                }
              : {}),
          };

          // Filter out null values for optimistic update
          const cleanedEvent = Object.fromEntries(
            Object.entries(updatedEvent).filter(([_, v]) => v !== null),
          ) as unknown as CalendarEvent;

          const events = insertIntoSorted(withoutEvent, cleanedEvent, (a) =>
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
          queryClient.setQueryData(queryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );
}

export function useDeleteEventMutation() {
  const trpc = useTRPC();

  const queryClient = useQueryClient();
  const { queryKey } = useEventQueryParams();

  return useMutation(
    trpc.events.delete.mutationOptions({
      onMutate: async ({ eventId }) => {
        await queryClient.cancelQueries({ queryKey });

        const previousEvents = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (prev) => {
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
          queryClient.setQueryData(queryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );
}
