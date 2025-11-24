import * as React from "react";
import { matchSorter } from "match-sorter";
import { Temporal } from "temporal-polyfill";

import {
  TIMEZONES_DISPLAY,
  TimeZoneDisplayValue,
  getDisplayValue,
} from "@/lib/timezones";

export function useTimezoneList(value: string) {
  return React.useMemo(() => {
    const timezones = [
      ...TIMEZONES_DISPLAY.filter((timezone) => timezone.id === value),
      ...TIMEZONES_DISPLAY.filter((timezone) => timezone.id !== value),
    ];

    const timezone = timezones.find((tz) => tz.id === value);
    const now = Temporal.Now.plainDateISO();

    return {
      timezones,
      displayValue: timezone ?? getDisplayValue(value, now),
    };
  }, [value]);
}

interface UseSearchProps {
  timezones: TimeZoneDisplayValue[];
  search: string;
}

export function useTimezoneSearch({ timezones, search }: UseSearchProps) {
  return React.useMemo(() => {
    if (!search) {
      return timezones;
    }

    return matchSorter(timezones, search, {
      keys: [
        (item) => item.city ?? "",
        (item) => item.id,
        (item) => item.name,
        (item) => item.offset.label.short,
        (item) => item.offset.label.long,
      ],
    });
  }, [timezones, search]);
}
