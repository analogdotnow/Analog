import { useMemo } from "react";
import { Temporal } from "temporal-polyfill";

import { useCalendarSettings } from "@/atoms/calendar-settings";
import { EventItem } from "@/components/event-calendar/event-item";
import { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { useZonedDateTime } from "../../event-calendar/context/datetime-provider";
import { EventCollectionItem } from "../../event-calendar/hooks/event-collection";
import { useNextEvent } from "./use-next-event";

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
  event: CalendarEvent;
  mode: "expanded" | "compact";
}

function UpcomingEvent({ event, mode }: TimeUntilProps) {
  const now = useZonedDateTime();
  const { defaultTimeZone, locale } = useCalendarSettings();

  const { duration, past } = useMemo(() => {
    if (event.start instanceof Temporal.Instant) {
      const duration = now.toInstant().until(event.start);
      return {
        duration: duration.abs(),
        past: duration.sign === -1,
      };
    }

    if (event.start instanceof Temporal.PlainDate) {
      const duration = now.until(event.start.toZonedDateTime(defaultTimeZone));
      return {
        duration: duration.abs(),
        past: duration.sign === -1,
      };
    }

    const duration = now.until(event.start);
    return {
      duration: duration.abs(),
      past: duration.sign === -1,
    };
  }, [defaultTimeZone, event.start, now]);

  if (mode === "compact") {
    return (
      <div className="flex gap-2">
        <p className="text-sm">{event.title ?? "(untitled)"}</p>
        <p className="text-sm">
          {past ? "" : "in"} {formatRelativeTime({ duration, locale })}
          {past ? " ago" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">
        {past ? "" : "in"} {formatRelativeTime({ duration, locale })}
        {past ? " ago" : ""}
      </p>
      <p>{event.title ?? "(untitled)"}</p>
    </div>
  );
}

interface OngoingEventProps {
  event: CalendarEvent;
}

function OngoingEvent({ event }: OngoingEventProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">{event.title} </div>
    </div>
  );
}

interface EventPreviewProps {
  className?: string;
  nextEvent: CalendarEvent | null;
  ongoingEvent: CalendarEvent | null;
}

export function EventPreview({
  className,
  nextEvent,
  ongoingEvent,
}: EventPreviewProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {nextEvent ? (
        <UpcomingEvent
          event={nextEvent}
          mode={ongoingEvent ? "compact" : "expanded"}
        />
      ) : (
        <span>No upcoming event</span>
      )}
      {ongoingEvent ? (
        <UpcomingEvent event={ongoingEvent} mode="expanded" />
      ) : (
        <span>No ongoing event</span>
      )}
    </div>
  );
}
