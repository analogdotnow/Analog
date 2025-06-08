import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useTestNotification() {
  const trpc = useTRPC();

  const mutate = useMutation(trpc.notification.create.mutationOptions());

  return {
    ...mutate,
    sendTestNotification: async (payload: {
      title: string;
      body: string;
      keys: {
        p256dh: string;
        auth: string;
      };
      endpoint: string;
    }) => {
      return mutate.mutateAsync(payload);
    },
  };
}
