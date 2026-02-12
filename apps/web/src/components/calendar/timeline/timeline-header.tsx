"use client";

import * as React from "react";

import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTimeZoneList } from "@/store/hooks";
import {
  TimeZonePopoverContent,
  TimeZonePopoverTrigger,
} from "./header/timezone-popover";

interface TimelineHeaderProps {
  className?: string;
}

export function TimelineHeader({ className }: TimelineHeaderProps) {
  "use memo";

  const timeZones = useTimeZoneList();

  return (
    <div
      className={cn(
        "grid grid-cols-[repeat(auto-fill,3rem)] items-end justify-end py-2 pb-2.5 text-center text-3xs font-medium text-muted-foreground/70 sm:grid-cols-[repeat(auto-fill,4rem)] sm:text-xs",
        timeZones.length > 1 &&
          "grid-cols-[3rem_repeat(auto-fill,2.5rem)] sm:grid-cols-[4rem_repeat(auto-fill,3rem)]",
        className,
      )}
    >
      {timeZones.map((timeZone) => (
        <TimelineHeaderItem key={timeZone.id} timeZoneId={timeZone.id}>
          {timeZone.label}
        </TimelineHeaderItem>
      ))}
    </div>
  );
}

export const MemoizedTimelineHeader = React.memo(TimelineHeader);

interface TimelineHeaderItemProps {
  children: React.ReactNode;
  timeZoneId: string;
}

function TimelineHeaderItem({ children, timeZoneId }: TimelineHeaderItemProps) {
  "use memo";

  return (
    <div className="flex justify-end">
      <Popover>
        <TimeZonePopoverTrigger>{children}</TimeZonePopoverTrigger>
        <TimeZonePopoverContent timeZoneId={timeZoneId} />
      </Popover>
    </div>
  );
}
