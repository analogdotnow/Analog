import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { calendarColorVariable } from "@/lib/css";
import { useTRPC } from "@/lib/trpc/client";

export function useDefaultCalendar() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());
  const color = React.useMemo(() => {
    if (!data?.defaultCalendar) {
      return "var(--color-muted-foreground)";
    }

    return `var(${calendarColorVariable(data?.defaultCalendar?.accountId, data?.defaultCalendar?.id)}, var(--color-muted-foreground))`;
  }, [data?.defaultCalendar]);

  return React.useMemo(() => {
    if (!data?.defaultCalendar) {
      return undefined;
    }

    return {
      ...data?.defaultCalendar,
      color,
    };
  }, [data?.defaultCalendar, color]);
}
