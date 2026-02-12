import * as React from "react";

import { calendarColorVariable } from "@/lib/css";
import { useDefaultCalendar as useDefaultCalendarStore } from "@/store/hooks";

export function useDefaultCalendar() {
  const defaultCalendar = useDefaultCalendarStore();

  const color = React.useMemo(() => {
    if (!defaultCalendar) {
      return "var(--color-muted-foreground)";
    }

    return `var(${calendarColorVariable(defaultCalendar.provider.accountId, defaultCalendar.id)}, var(--color-muted-foreground))`;
  }, [defaultCalendar]);

  return React.useMemo(() => {
    if (!defaultCalendar) {
      return undefined;
    }

    return {
      ...defaultCalendar,
      color,
    };
  }, [defaultCalendar, color]);
}
