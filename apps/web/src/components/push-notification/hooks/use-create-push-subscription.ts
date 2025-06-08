import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useCreatePushSubscription() {
  const trpc = useTRPC();

  const mutate = useMutation(trpc.notification.subscribe.mutationOptions());

  return {
    ...mutate,
    subscribeAsync: mutate.mutateAsync,
  };
}
