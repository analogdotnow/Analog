"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { SolarTerminatorMap } from "./solar-terminator-map";
import { TimeZoneDetails } from "./timezone";

interface TimeZonePopoverTriggerProps {
  children: React.ReactNode;
}

export function TimeZonePopoverTrigger({
  children,
}: TimeZonePopoverTriggerProps) {
  "use memo";

  return (
    <PopoverTrigger
      render={
        <Button
          variant="ghost"
          size="sm"
          className="h-fit max-w-full min-w-10 justify-start rounded-sm px-0 py-0.5 ps-0.5 text-end text-xs leading-3.5 data-[state=open]:bg-accent-light sm:min-w-12 dark:data-[state=open]:bg-accent-light"
        />
      }
    >
      <div className="min-w-full mask-r-from-80% mask-r-to-90%">
        <span className="min-w-full pe-2 text-end sm:pe-4">{children}</span>
      </div>
    </PopoverTrigger>
  );
}

interface TimeZonePopoverContentProps {
  timeZoneId: string;
}

export function TimeZonePopoverContent({
  timeZoneId,
}: TimeZonePopoverContentProps) {
  "use memo";

  const currentDate = useCalendarStore((s) => s.currentDate);

  return (
    <PopoverContent
      className="dark min-w-(--radix-popper-anchor-width) p-0 select-none"
      align="start"
    >
      <SolarTerminatorMap timeZoneId={timeZoneId} date={currentDate} />
      <Separator orientation="horizontal" className="bg-primary/10" />
      <TimeZoneDetails
        className="px-2 py-2"
        timeZoneId={timeZoneId}
        date={currentDate}
      />
    </PopoverContent>
  );
}
