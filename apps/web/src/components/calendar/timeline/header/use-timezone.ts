import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { getDisplayValue } from "@/lib/timezones";

interface UseTimeZoneOptions {
  date: Temporal.PlainDate;
  timeZoneId: string;
}

export function useTimeZone({ date, timeZoneId }: UseTimeZoneOptions) {
  return React.useMemo(() => {
    const value = getDisplayValue(timeZoneId, date);
    const dateTime = date.toZonedDateTime(timeZoneId);

    return { ...value, offset: { ...value.offset, label: dateTime.offset } };
  }, [date, timeZoneId]);
}
