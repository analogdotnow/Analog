import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

// Optimistic state, cache write-through, error rollback, and the list
// refetch are owned by the write lane (components/calendar/flows/write-lane),
// which serializes and coalesces writes per event.
export function useCreateEventMutation() {
  const trpc = useTRPC();

  return useMutation(trpc.events.create.mutationOptions());
}

export function useUpdateEventMutation() {
  const trpc = useTRPC();

  return useMutation(trpc.events.update.mutationOptions());
}

export function useDeleteEventMutation() {
  const trpc = useTRPC();

  return useMutation(trpc.events.delete.mutationOptions());
}
