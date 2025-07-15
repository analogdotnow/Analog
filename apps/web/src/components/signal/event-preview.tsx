import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { EventItem } from "@/components/event-calendar/event-item";
import { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { useNextEvent } from "./use-next-event";

interface EventPreviewProps {
  className?: string;
  events: CalendarEvent[];
}

interface FormatRelativeTimeOptions {
  duration: Temporal.Duration;
  locale: string;
}

const formatRelativeTime = ({
  duration,
  locale,
}: FormatRelativeTimeOptions) => {
  if (duration.total({ unit: "minute" }) < 1) {
    return "now";
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
      days: duration.days,
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

export function EventPreview({ className, events }: EventPreviewProps) {
  const { nextEvent, ongoingEvent } = useNextEvent({ events });
  const { defaultTimeZone, locale } = useCalendarSettings();

  const now = Temporal.Now.zonedDateTimeISO(defaultTimeZone);

  const timeUntil = useMemo(() => {
    const start = nextEvent?.start;

    if (!nextEvent) {
      return null;
    }

    if (start instanceof Temporal.ZonedDateTime) {
      return now.until(start);
    }

    if (start instanceof Temporal.Instant) {
      return now.toInstant().until(start);
    }

    if (start instanceof Temporal.PlainDate) {
      return now.until(start);
    }

    return null;
  }, [nextEvent, now]);

  return (
    <div className={cn("flex flex-col gap-2 px-2", className)}>
      {nextEvent && timeUntil ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            in {formatRelativeTime({ duration: timeUntil, locale })}
          </p>
          <EventItem className="m-0 ring-0" event={nextEvent} view="day" />
        </div>
      ) : null}
      {ongoingEvent ? (
        <div className="flex flex-col gap-2">
          <div className="text-sm">{ongoingEvent.title} </div>
        </div>
      ) : null}
    </div>
  );
}
