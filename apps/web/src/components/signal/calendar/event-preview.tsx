import React, { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { EventCollectionItem } from "@/components/calendar/hooks/event-collection";
import { calendarColorVariable } from "@/lib/css";
import { cn } from "@/lib/utils";

interface FormatRelativeTimeOptions {
  duration: Temporal.Duration;
  locale: string;
}

const formatRelativeTime = ({
  duration,
  locale,
}: FormatRelativeTimeOptions) => {
  if (duration.total({ unit: "second" }) < 0) {
    return "now";
  }

  if (duration.total({ unit: "second" }) < 1) {
    return "a few seconds";
  }

  if (duration.total({ unit: "minute" }) < 2) {
    const simplified = Temporal.Duration.from({
      minutes: duration.minutes,
      seconds: duration.seconds,
    });

    return simplified.toLocaleString(locale, {
      minute: "numeric",
      second: "numeric",
    });
  }

  if (duration.total({ unit: "minute" }) < 60) {
    const simplified = Temporal.Duration.from({
      minutes: duration.minutes,
    });

    return simplified.toLocaleString(locale, {
      minute: "numeric",
    });
  }

  if (duration.total({ unit: "hour" }) < 8) {
    const simplified = Temporal.Duration.from({
      hours: duration.hours,
      minutes: duration.minutes,
    });

    return simplified.toLocaleString(locale, {
      hour: "numeric",
      minute: "numeric",
    });
  }

  if (duration.total({ unit: "hour" }) < 48) {
    const simplified = Temporal.Duration.from({
      days: duration.days,
      hours: duration.hours,
    });

    return simplified.toLocaleString(locale, {
      day: "numeric",
      hour: "numeric",
    });
  }

  if (duration.total({ unit: "day" }) < 7) {
    const simplified = Temporal.Duration.from({
      days: Math.floor(duration.total({ unit: "day" })),
    });

    return simplified.toLocaleString(locale, {
      day: "numeric",
    });
  }

  const simplified = Temporal.Duration.from({
    days: duration.days,
    months: duration.months,
    years: duration.years,
  });

  return simplified.toLocaleString(locale, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
};

interface TimeUntilProps {
  item: EventCollectionItem;
  mode: "expanded" | "compact";
}

function UpcomingEvent({ item, mode }: TimeUntilProps) {
  const now = useZonedDateTime();
  const { defaultTimeZone, locale } = useAtomValue(calendarSettingsAtom);

  const { duration, past } = useMemo(() => {
    if (item.event.start instanceof Temporal.Instant) {
      const duration = now.toInstant().until(item.event.start);
      return {
        duration: duration.abs(),
        past: duration.sign === -1,
      };
    }

    if (item.event.start instanceof Temporal.PlainDate) {
      const duration = now.until(
        item.event.start.toZonedDateTime(defaultTimeZone),
      );
      return {
        duration: duration.abs(),
        past: duration.sign === -1,
      };
    }

    const duration = now.until(item.event.start);
    return {
      duration: duration.abs(),
      past: duration.sign === -1,
    };
  }, [defaultTimeZone, item.event.start, now]);

  const displayTitle =
    item.event.title && item.event.title.length
      ? item.event.title
      : "(untitled)";

  const color =
    item.event.color ??
    `var(${calendarColorVariable(item.event.accountId, item.event.calendarId)}, var(--color-muted-foreground))`;

  if (mode === "compact") {
    return (
      <div
        className="flex gap-2"
        style={
          {
            "--calendar-color": color,
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "w-1 shrink-0 self-stretch rounded-lg bg-[color-mix(in_oklab,var(--background),var(--calendar-color)_90%)] opacity-40",
          )}
        />
        <p className="text-sm">{displayTitle}</p>
        <p className="text-sm">
          {past ? "" : "in"} {formatRelativeTime({ duration, locale })}
          {past ? " ago" : ""}
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex gap-2"
      style={
        {
          "--calendar-color": color,
        } as React.CSSProperties
      }
    >
      <div className="w-1 shrink-0 self-stretch rounded-lg bg-[color-mix(in_oklab,var(--background),var(--calendar-color)_90%)] opacity-40" />
      <div className="flex flex-col gap-2">
        <p className="text-sm">
          {past ? "" : "in"} {formatRelativeTime({ duration, locale })}
          {past ? " ago" : ""}
        </p>
        <p>{displayTitle}</p>
      </div>
    </div>
  );
}

interface EventPreviewProps {
  className?: string;
  nextEvent: EventCollectionItem | null;
  ongoingEvent: EventCollectionItem | null;
}

export function EventPreview({
  className,
  nextEvent,
  ongoingEvent,
}: EventPreviewProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {nextEvent ? (
        <UpcomingEvent
          item={nextEvent}
          mode={ongoingEvent ? "compact" : "expanded"}
        />
      ) : (
        <span>No upcoming event</span>
      )}
      {ongoingEvent ? (
        <UpcomingEvent item={ongoingEvent} mode="expanded" />
      ) : (
        <span>No ongoing event</span>
      )}
    </div>
  );
}
