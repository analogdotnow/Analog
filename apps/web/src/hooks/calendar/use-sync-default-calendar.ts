import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";
import { useSetDefaultCalendar } from "@/store/hooks";

export function useSyncDefaultCalendar() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());
  const setDefaultCalendar = useSetDefaultCalendar();

  useEffect(() => {
    if (data?.defaultCalendar) {
      setDefaultCalendar(data.defaultCalendar);
    }
  }, [data?.defaultCalendar, setDefaultCalendar]);
}
