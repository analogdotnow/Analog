import { Temporal } from "temporal-polyfill";

import { formatTime } from "@/lib/utils/format";

/**
 * Configuration for generating time suggestions
 */
export interface TimeSuggestionConfig {
  /** Start hour (0-23) */
  startHour?: number;
  /** End hour (0-23) */
  endHour?: number;
  /** Interval in minutes */
  interval?: number;
  /** Whether to use 12-hour format for labels */
  use12Hour?: boolean;
  /** Timezone to use for generation */
  timeZone?: string;
}

/**
 * A time suggestion item
 */
export interface TimeSuggestion {
  label: string;
  value: string;
}

export function generateTimeSuggestions(
  config: TimeSuggestionConfig = {},
): TimeSuggestion[] {
  const {
    startHour = 9,
    endHour = 23,
    interval = 60,
    use12Hour = true,
    timeZone = "UTC",
  } = config;

  const suggestions: TimeSuggestion[] = [];

  const now = Temporal.Now.zonedDateTimeISO(timeZone);
  const today = now.startOfDay();

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = today.add({ hours: hour, minutes: minute });

      const plainTime = time.toPlainTime();
      const hour12 = plainTime.hour % 12 || 12;

      let label: string;

      if (use12Hour) {
        const minute = plainTime.minute.toString().padStart(2, "0");

        label = `${hour12}:${minute} ${plainTime.hour < 12 ? "AM" : "PM"}`;
      } else {
        const hour = plainTime.hour.toString().padStart(2, "0");
        const minute = plainTime.minute.toString().padStart(2, "0");

        label = `${hour}:${minute}`;
      }

      const value = `${plainTime.hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      suggestions.push({ label, value });
    }
  }

  return suggestions;
}

export function generateCommonTimeSuggestions(): TimeSuggestion[] {
  return generateTimeSuggestions({
    startHour: 0,
    endHour: 23,
    interval: 15,
    use12Hour: true,
  });
}

interface CreateItemOptions {
  key?: string;
  time: Temporal.ZonedDateTime;
  use12Hour: boolean;
  locale: string;
}

interface CreateItemResult {
  time: Temporal.PlainTime;
  label: string;
  formattedIn12h: string;
  formattedIn24h: string;
}

function createItem({ time, use12Hour, locale }: CreateItemOptions) {
  const formattedIn12h = formatTime({ value: time, use12Hour: true, locale });
  const formattedIn24h = formatTime({ value: time, use12Hour: false, locale });

  return {
    time: time.toPlainTime(),
    label: use12Hour ? formattedIn12h : formattedIn24h,
    formattedIn12h,
    formattedIn24h,
  };
}

interface TimeSuggestionsListOptions {
  locale: string;
  timeZone: string;
  use12Hour: boolean;
}

function timeSuggestionsList({
  locale,
  timeZone,
  use12Hour,
}: TimeSuggestionsListOptions) {
  const list: CreateItemResult[] = [];

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
