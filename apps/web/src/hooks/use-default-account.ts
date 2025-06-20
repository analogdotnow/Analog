import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useDefaultAccount() {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.accounts.getDefault.queryOptions());

  return data?.account;
}
