import { Temporal } from "temporal-polyfill";

import { isAfter, toZonedDateTime } from "@repo/temporal";

import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";

interface RelativeTimeOptions {
  start: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
  timeZone?: string;
}

function formatDuration(duration: Temporal.Duration) {
  const totalMinutes = Math.floor(Math.abs(duration.total("minutes")));
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d`;
  }

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  if (totalMinutes > 0) {
    return `${totalMinutes}m`;
  }

  return "now";
}

export type RelativeTimeResult = {
  label: string;
  status: "upcoming" | "ongoing";
};

export function useRelativeTime(
  options: RelativeTimeOptions,
): RelativeTimeResult {
  const now = useZonedDateTime();

  const start = toZonedDateTime(options.start, {
    timeZone: options.timeZone ?? now.timeZoneId,
  });

  if (isAfter(start, now, { timeZone: now.timeZoneId })) {
    const duration = formatDuration(now.until(start));

    return {
      label: duration === "now" ? "now" : `in ${duration}`,
      status: "upcoming",
    };
  }

  const duration = formatDuration(start.until(now));

  return {
    label: duration === "now" ? "now" : `${duration} ago`,
    status: "ongoing",
  };
}
