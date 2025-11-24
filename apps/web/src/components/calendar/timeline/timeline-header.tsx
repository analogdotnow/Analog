"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { timeZonesAtom } from "@/atoms/timezones";
import { currentDateAtom } from "@/atoms/view-preferences";
import { Popover } from "@/components/ui/popover";
import {
  TimeZonePopoverContent,
  TimeZonePopoverTrigger,
} from "./header/timezone-popover";
import { useTimeZoneDisplay } from "./header/use-timezone-info";

export function TimelineHeader() {
  const timeZones = useAtomValue(timeZonesAtom);

  return (
    <div className="grid grid-flow-col grid-cols-[3rem_repeat(auto-fill,2.5rem)] items-end justify-end py-2 pb-2.5 text-center text-sm text-[10px] font-medium text-muted-foreground/70 sm:grid-cols-[4rem_repeat(auto-fill,3rem)] sm:text-xs">
      {timeZones.map((timeZone) => (
        <TimelineHeaderItem key={timeZone.id} timeZoneId={timeZone.id} />
      ))}
    </div>
  );
}

interface TimelineHeaderItemProps {
  timeZoneId: string;
}

export function TimelineHeaderItem({ timeZoneId }: TimelineHeaderItemProps) {
  const date = useAtomValue(currentDateAtom);
  const displayValue = useTimeZoneDisplay({ date, timeZoneId });

  return (
    <div className="flex justify-end">
      <Popover>
        <TimeZonePopoverTrigger>
          {displayValue.abbreviation}
        </TimeZonePopoverTrigger>
        <TimeZonePopoverContent timeZoneId={timeZoneId} />
      </Popover>
    </div>
  );
}
