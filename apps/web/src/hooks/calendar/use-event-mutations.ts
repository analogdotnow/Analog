import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { isBefore } from "@repo/temporal";

import { CalendarEvent } from "@/lib/interfaces";
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

          const events = insertIntoSorted(
            prev.events || [],
            newEvent as CalendarEvent,
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
        // Path-level: the agenda view holds per-chunk events.list caches
        // beyond the single key optimistically updated above; leaving them
        // stale resurrects deleted events and hides created ones there.
        queryClient.invalidateQueries({ queryKey: trpc.events.list.pathKey() });
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

          const existing = prev.events.find((e) => e.id === data.id);

          // A sparse patch is not a full event, so there is nothing to insert
          // when the target (e.g. a series master) is not in the timeline;
          // the refetch on settle covers it.
          if (!existing) {
            return prev;
          }

          // The patch is sparse; unchanged fields come from the cached event.
          const updatedEvent = {
            ...existing,
            ...data,
            ...(move?.destination
              ? {
                  calendar: move.destination,
                }
              : {}),
          } as CalendarEvent;

          const withoutEvent = prev.events.filter((e) => e.id !== data.id);

          const events = insertIntoSorted(withoutEvent, updatedEvent, (a) =>
            isBefore(a.start, updatedEvent.start, {
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
        // Path-level: the agenda view holds per-chunk events.list caches
        // beyond the single key optimistically updated above; leaving them
        // stale resurrects deleted events and hides created ones there.
        queryClient.invalidateQueries({ queryKey: trpc.events.list.pathKey() });
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
        // Path-level: the agenda view holds per-chunk events.list caches
        // beyond the single key optimistically updated above; leaving them
        // stale resurrects deleted events and hides created ones there.
        queryClient.invalidateQueries({ queryKey: trpc.events.list.pathKey() });
      },
    }),
  );
}
