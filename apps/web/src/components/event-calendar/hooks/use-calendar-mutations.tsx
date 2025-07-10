import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toInstant } from "@repo/temporal";

import { useTRPC } from "@/lib/trpc/client";

export function useCalendarMutations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryKey = trpc.events.list.queryKey();

  const createMutation = useMutation(
    trpc.events.create.mutationOptions({
      onMutate: async (newEvent) => {
        await queryClient.cancelQueries({ queryKey });

        const previousEvents = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (prev) => {
          if (!prev) {
            return undefined;
          }

          return {
            ...prev,
            events: [...(prev.events || []), newEvent].sort(
              (a, b) =>
                toInstant({ value: a.start, timeZone: "UTC" })
                  .epochMilliseconds -
                toInstant({ value: b.start, timeZone: "UTC" })
                  .epochMilliseconds,
            ),
          };
        });

        return { previousEvents };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousEvents) {
          queryClient.setQueryData(queryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.events.update.mutationOptions({
      onMutate: async (updatedEvent) => {
        await queryClient.cancelQueries({ queryKey });

        const previousEvents = queryClient.getQueryData(queryKey);

        queryClient.setQueryData(queryKey, (prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            events: prev.events
              .map((event) =>
                event.id === updatedEvent.id
                  ? {
                      ...event,
                      ...updatedEvent,
                    }
                  : event,
              )
              .sort(
                (a, b) =>
                  toInstant({ value: a.start, timeZone: "UTC" })
                    .epochMilliseconds -
                  toInstant({ value: b.start, timeZone: "UTC" })
                    .epochMilliseconds,
              ),
          };
        });

        return { previousEvents };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousEvents) {
          queryClient.setQueryData(queryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  const deleteMutation = useMutation(
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
      onError: (_error, _variables, context) => {
        if (context?.previousEvents) {
          queryClient.setQueryData(queryKey, context.previousEvents);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
