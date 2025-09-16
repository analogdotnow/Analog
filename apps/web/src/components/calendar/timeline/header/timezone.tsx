"use client";

import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { TimeZoneAwareGlobeIcon } from "@/components/timezone-aware-globe-icon";
import { cn } from "@/lib/utils";
import { format, formatTime } from "@/lib/utils/format";
import { useTimeZoneDisplay } from "./use-timezone-info";

interface TimeZoneDetailsProps {
  className?: string;
  timeZoneId: string;
  date: Temporal.PlainDate;
}

export function TimeZoneDetails({
  className,
  timeZoneId,
  date,
}: TimeZoneDetailsProps) {
  const displayValue = useTimeZoneDisplay({ date, timeZoneId });

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <TimeZoneAwareGlobeIcon
        offset={displayValue.offset.value}
        className="size-4 text-muted-foreground hover:text-foreground"
      />
      <div className="flex grow flex-col gap-0.5">
        <div className="flex gap-1">
          <span className="text-sm font-medium">
            {displayValue.city ?? displayValue.name}
          </span>
          {/* <OffsetDisplay timeZoneId={timeZoneId} /> */}
        </div>
        <div className="flex gap-1">
          <span className="text-xs font-medium text-muted-foreground/70">
            {displayValue.name}
          </span>
          <span className="text-xs font-medium text-muted-foreground/70">
            ({displayValue.offset.label})
          </span>
        </div>
      </div>
      <TimeDisplay timeZoneId={timeZoneId} />
    </div>
  );
}

interface OffsetDisplayProps {
  timeZoneId: string;
}

function OffsetDisplay({ timeZoneId }: OffsetDisplayProps) {
  const now = useZonedDateTime();

  const offset = React.useMemo(() => {
    const offsetInMinutes = Temporal.Duration.from({
      nanoseconds:
        now.withTimeZone(timeZoneId).offsetNanoseconds - now.offsetNanoseconds,
    }).total({ unit: "minute" });

    const isEarlier = offsetInMinutes < 0;

    if (offsetInMinutes === 0) {
      return null;
    }

    return `${isEarlier ? "-" : "+"}${(Math.abs(offsetInMinutes) / 60).toFixed(0)}h${Math.abs(offsetInMinutes) % 60 > 0 ? `and ${(Math.abs(offsetInMinutes) % 60).toFixed(0)} m` : ""}`;
  }, [now, timeZoneId]);

  if (timeZoneId === now.timeZoneId || !offset) {
    return null;
  }

  return (
    <span className="text-xs font-medium text-muted-foreground/70">
      ({offset})
    </span>
  );
}

interface TimeDisplayProps {
  className?: string;
  timeZoneId: string;
}

function TimeDisplay({ className, timeZoneId }: TimeDisplayProps) {
  const currentTime = useZonedDateTime();
  const { use12Hour } = useAtomValue(calendarSettingsAtom);

  const time = React.useMemo(() => {
    return currentTime.withTimeZone(timeZoneId);
  }, [currentTime, timeZoneId]);

  return (
    <div className={cn("flex flex-col items-end gap-0.5", className)}>
      <span className="text-xs font-medium">
        {formatTime({ value: time, use12Hour, locale: "en" })}
      </span>
      <span className="text-xs font-medium text-muted-foreground/70">
        {format(time, "MMM D", "en", timeZoneId)}
      </span>
    </div>
  );
}
