"use client";

import * as React from "react";
import { Temporal } from "temporal-polyfill";

import { useZonedDateTime } from "@/components/calendar/context/datetime-provider";
import { TimeZoneAwareGlobeIcon } from "@/components/timezone-aware-globe-icon";
import { cn } from "@/lib/utils";
import { format, formatTime } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
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
  "use memo";

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

interface TimeDisplayProps {
  className?: string;
  timeZoneId: string;
}

function TimeDisplay({ className, timeZoneId }: TimeDisplayProps) {
  "use memo";

  const currentTime = useZonedDateTime();
  const use12Hour = useCalendarStore((s) => s.calendarSettings.use12Hour);
  const locale = useCalendarStore((s) => s.calendarSettings.locale);

  const time = React.useMemo(() => {
    return currentTime.withTimeZone(timeZoneId);
  }, [currentTime, timeZoneId]);

  return (
    <div className={cn("flex flex-col items-end gap-0.5", className)}>
      <span className="text-xs font-medium">
        {formatTime({ value: time, use12Hour, locale })}
      </span>
      <span className="text-xs font-medium text-muted-foreground/70">
        {format(time, "MMM D", timeZoneId, locale)}
      </span>
    </div>
  );
}
