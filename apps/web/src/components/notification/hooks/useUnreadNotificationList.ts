import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useUnreadNotificationList(enabled: boolean = false) {
  const trpc = useTRPC();
  // TODO: Change to useInfiniteQuery when pagination is implemented
  const data = useQuery({
    ...trpc.notification.list.queryOptions({
      read: false,
    }),
    enabled: enabled,
  });
  return {
    ...data,
    notifications: data.data?.data,
  };
}
