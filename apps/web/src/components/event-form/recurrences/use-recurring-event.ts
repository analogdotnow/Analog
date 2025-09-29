import * as React from "react";

import { useLiveEventById } from "@/lib/db";
import { CalendarEvent } from "@/lib/interfaces";

type BaseEvent = Omit<CalendarEvent, "recurrence"> &
  Required<Pick<CalendarEvent, "recurrence">>;

export function useRecurringEvent(recurringEventId?: string) {
  const event = useLiveEventById(recurringEventId ?? "");

  return React.useMemo(() => {
    if (!recurringEventId) {
      return undefined;
    }

    return event as BaseEvent | undefined;
  }, [event, recurringEventId]);
}
