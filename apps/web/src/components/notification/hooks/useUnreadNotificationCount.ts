import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useUnreadNotificationCount() {
  const trpc = useTRPC();
  const data = useQuery(trpc.notification.unreadCount.queryOptions());
  return {
    ...data,
    count: data.data?.count,
  };
}
