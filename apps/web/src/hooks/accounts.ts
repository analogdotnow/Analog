import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useCurrentUser() {
  const trpc = useTRPC();
  return useQuery(trpc.user.me.queryOptions());
}
