import { TimeZoneDisplayValue, TIMEZONES_DISPLAY } from "@/lib/timezones";
import * as React from "react";
import { Temporal } from "temporal-polyfill";
import { getDisplayValue } from "@/lib/timezones";
import { matchSorter } from "match-sorter";

export function useTimezoneList(value: string) {
  return React.useMemo(() => {
    if (!value) {
      const timezone = TIMEZONES_DISPLAY.find((tz) => tz.id === value);
      const now = Temporal.Now.plainDateISO();
      return {
        timezones: TIMEZONES_DISPLAY,
        displayValue: timezone ?? getDisplayValue(value, now),
      };
    }

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
        (item) => item.id,
        (item) => item.name,
        (item) => item.offset.label,
      ],
    });
  }, [timezones, search]);
}
