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
                  calendar: move.destination,
                }
              : {}),
          };

          const events = insertIntoSorted(
            withoutEvent,
            updatedEvent as CalendarEvent,
            (a) =>
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
