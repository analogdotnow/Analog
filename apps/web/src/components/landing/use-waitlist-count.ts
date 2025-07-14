import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/lib/trpc/client";

export function useWaitlistCount() {
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const query = useQuery(trpc.earlyAccess.getWaitlistCount.queryOptions());

  const [success, setSuccess] = React.useState(false);

  const { mutate } = useMutation(
    trpc.earlyAccess.joinWaitlist.mutationOptions({
      onSuccess: () => {
        setSuccess(true);

        queryClient.setQueryData(
          [trpc.earlyAccess.getWaitlistCount.queryKey()],
          {
            count: (query.data?.count ?? 0) + 1,
          },
        );
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    }),
  );

  return { count: query.data?.count ?? 0, mutate, success };
}
