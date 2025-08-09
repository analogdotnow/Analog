import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

function useAccounts() {
  const trpc = useTRPC();

  const { data, isLoading, error } = useQuery(
    trpc.accounts.list.queryOptions(),
  );

  return {
    accounts: data?.accounts,
    isLoading,
    error,
  };
}

function useDefaultAccount() {
  const trpc = useTRPC();

  const { data } = useQuery(trpc.accounts.getDefault.queryOptions());

  return data?.account;
}

export function useCurrentUser() {
  const trpc = useTRPC();
  return useQuery(trpc.user.me.queryOptions());
}
