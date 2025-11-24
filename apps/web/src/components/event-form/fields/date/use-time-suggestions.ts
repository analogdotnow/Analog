"use client";

import * as React from "react";
import { parseDate } from "chrono-node";
import { useAtomValue } from "jotai";
import { matchSorter } from "match-sorter";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { formatTime } from "@/lib/utils/format";

export interface TimeInputValue {
  key: string;
  id: number;
  time: Temporal.PlainTime;
  label: string;
  formattedIn12h: string;
  formattedIn24h: string;
}

interface CreateItemOptions {
  key?: string;
  time: Temporal.ZonedDateTime;
  use12Hour: boolean;
  locale: string;
}

function createItem({
  key,
  time,
  use12Hour,
  locale,
}: CreateItemOptions): TimeInputValue {
  const formattedIn12h = formatTime({ value: time, use12Hour: true, locale });
  const formattedIn24h = formatTime({ value: time, use12Hour: false, locale });

  return {
    key: key ?? `${time.epochMilliseconds}`,
    id: time.epochMilliseconds,
    time: time.toPlainTime(),
    label: use12Hour ? formattedIn12h : formattedIn24h,
    formattedIn12h,
    formattedIn24h,
  };
}

interface GenerateListOptions {
  locale: string;
  timeZone: string;
  use12Hour: boolean;
}

function generateList({ locale, timeZone, use12Hour }: GenerateListOptions) {
  const list: TimeInputValue[] = [];

  const startOfDay = Temporal.Now.zonedDateTimeISO(timeZone).startOfDay();

  for (let hours = 0; hours < 24; hours++) {
    const date = startOfDay.add({ hours });

    for (let minutes = 0; minutes < 60; minutes += 15) {
      const item = createItem({
        time: date.add({ minutes }),
        use12Hour,
        locale,
      });

      list.push(item);
    }
  }

  return list;
}

export function useTimeSuggestionsList() {
  const settings = useAtomValue(calendarSettingsAtom);

  return React.useMemo(() => {
    return generateList({
      locale: settings.locale,
      timeZone: settings.defaultTimeZone,
      use12Hour: settings.use12Hour,
    });
  }, [settings.locale, settings.defaultTimeZone, settings.use12Hour]);
}

export function useTimeSuggestions(searchValue: string) {
  const settings = useAtomValue(calendarSettingsAtom);
  const list = useTimeSuggestionsList();

  return React.useMemo(() => {
    const parsedDate = parseDate(searchValue);

    const matches = matchSorter(list, searchValue, {
      keys: ["formattedIn24h"],
    });

    if (!parsedDate) {
      return matches.map((item) => ({
        ...item,
        key: `suggestion-${item.id}`,
      }));
    }

    const instant = Temporal.Instant.fromEpochMilliseconds(
      parsedDate.getTime(),
    );

    if (matches.some((item) => item.id === parsedDate.getTime())) {
      return matches;
    }

    const parsedTime = createItem({
      key: `suggestion-${parsedDate.getTime()}`,
      time: instant.toZonedDateTimeISO(settings.defaultTimeZone),
      locale: settings.locale,
      use12Hour: settings.use12Hour,
    });

    return [parsedTime].concat(matches);
  }, [
    list,
    searchValue,
    settings.defaultTimeZone,
    settings.locale,
    settings.use12Hour,
  ]);
}
