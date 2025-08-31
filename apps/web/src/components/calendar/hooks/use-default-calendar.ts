import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { calendarColorVariable } from "@/lib/css";
import { useTRPC } from "@/lib/trpc/client";

export function useDefaultCalendar() {
  const trpc = useTRPC();
  const query = useQuery(trpc.calendars.list.queryOptions());
  const color = React.useMemo(() => {
    if (!query.data?.defaultCalendar) {
      return "var(--color-muted-foreground)";
    }

    return `var(${calendarColorVariable(query.data?.defaultCalendar?.accountId, query.data?.defaultCalendar?.id)}, var(--color-muted-foreground))`;
  }, [query.data?.defaultCalendar]);

  return {
    ...query.data?.defaultCalendar,
    color,
  };
}
