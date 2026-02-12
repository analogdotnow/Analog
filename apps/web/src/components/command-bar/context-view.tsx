"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { Button } from "@/components/ui/button";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import { useSelectAction } from "@/hooks/calendar/use-optimistic-mutations";
import { useRelativeTime } from "@/hooks/time/use-relative-time";
import { eventColorVariable } from "@/lib/css";
import { useOngoingEvent, useUpcomingEvent } from "@/lib/db";
import { cn } from "@/lib/utils";
import { isOnlineMeeting } from "@/lib/utils/events";
import { format, formatTime } from "@/lib/utils/format";
import { useCalendarSettings, useDefaultTimeZone } from "@/store/hooks";

interface ContextViewProps {
  className?: string;
}

export function ContextView({ className }: ContextViewProps) {
  "use memo";

  return (
    <div className={cn("flex h-8 justify-stretch gap-1", className)}>
      <EventPreview />
    </div>
  );
}

function useDisplayEvent() {
  "use memo";

  const ongoing = useOngoingEvent();
  const upcoming = useUpcomingEvent();

  return ongoing[0] ? ongoing[0] : (upcoming[0] ?? null);
}

interface EventPreviewProps {
  className?: string;
}

export function EventPreview({ className }: EventPreviewProps) {
  "use memo";

  const event = useDisplayEvent();
  const selectAction = useSelectAction();

  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!event) {
        return;
      }

      e.stopPropagation();
      selectAction(event);
    },
    [event, selectAction],
  );

  if (!event) {
    return null;
  }

  return (
    <div
      className={cn("flex h-8 items-center justify-stretch gap-1", className)}
    >
      <Button variant="ghost" size="sm" className="ps-1 pe-2" onClick={onClick}>
        <div
          className="h-6 w-1 rounded-full bg-(--calendar-color) opacity-60"
          style={{
            "--calendar-color": `var(${eventColorVariable(event)}, var(--color-muted-foreground))`,
          }}
        />
        <span className="text-sm font-medium">
          {event.title ?? "(untitled)"}
        </span>
        <RelativeTime value={event.start} />
      </Button>

      {isOnlineMeeting(event) ? (
        <Button
          variant="ghost"
          size="sm"
          className="ps-1 pe-2"
          render={(props) => (
            <a
              href={event.conference.video.joinUrl.value}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              Join meeting
              <KeyboardShortcut className="ml-auto bg-transparent text-muted-foreground">
                J
              </KeyboardShortcut>
            </a>
          )}
        />
      ) : null}

      {/* <div className="flex flex-1 flex-col gap-2">
        <div className="flex h-16 items-center justify-start gap-2 py-1 ps-1">
          <p className="text-sm font-medium">{event.title ?? "(untitled)"}</p>
          <RelativeTime value={event.start} />
        </div>
        <div className="flex items-center gap-2 pb-1">
          <Time value={event.start} />
          <ArrowRightIcon className="size-4 opacity-60" />
          <Time value={event.end} />
        </div>
      </div> */}
    </div>
  );
}

interface RelativeTimeProps {
  className?: string;
  value: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
}

function RelativeTime({ className, value }: RelativeTimeProps) {
  "use memo";

  const { label } = useRelativeTime({ start: value });

  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      {label}
    </span>
  );
}

interface TimeProps {
  className?: string;
  value: Temporal.ZonedDateTime | Temporal.Instant | Temporal.PlainDate;
}

function Time({ className, value }: TimeProps) {
  "use memo";

  const defaultTimeZone = useDefaultTimeZone();
  const calendarSettings = useCalendarSettings();
  const { use12Hour, locale } = calendarSettings;

  if (value instanceof Temporal.PlainDate) {
    return (
      <time
        dateTime={value.toString()}
        className={cn("text-sm text-muted-foreground", className)}
      >
        {format({
          value,
          format: "MMM d",
          timeZone: defaultTimeZone,
          locale,
        })}
      </time>
    );
  }

  return (
    <time
      dateTime={
        value instanceof Temporal.ZonedDateTime
          ? value.toString({ timeZoneName: "never" })
          : value.toString()
      }
      className={cn("text-sm text-muted-foreground tabular-nums", className)}
    >
      {formatTime({
        value,
        use12Hour,
        locale,
        timeZone: defaultTimeZone,
      })}
    </time>
  );
}
