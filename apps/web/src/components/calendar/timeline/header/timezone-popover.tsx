"use client";

import * as React from "react";
import { useAtomValue } from "jotai";

import { currentDateAtom } from "@/atoms/view-preferences";
import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SolarTerminatorMap } from "./solar-terminator-map";
import { TimeZoneDetails } from "./timezone";

interface TimeZonePopoverTriggerProps {
  children: React.ReactNode;
}

export function TimeZonePopoverTrigger({
  children,
}: TimeZonePopoverTriggerProps) {
  return (
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="h-fit max-w-full min-w-10 justify-start rounded-sm px-0 py-0.5 ps-0.5 text-end text-xs leading-3.5 data-[state=open]:bg-accent/80 sm:min-w-12 dark:data-[state=open]:bg-accent/80"
      >
        <div className="min-w-full mask-r-from-80% mask-r-to-90%">
          <span className="min-w-full pe-2 text-end sm:pe-4">{children}</span>
        </div>
      </Button>
    </PopoverTrigger>
  );
}

interface TimeZonePopoverContentProps {
  timeZoneId: string;
}

export function TimeZonePopoverContent({
  timeZoneId,
}: TimeZonePopoverContentProps) {
  const date = useAtomValue(currentDateAtom);

  return (
    <PopoverContent
      className="dark min-w-(--radix-popper-anchor-width) p-0 select-none"
      align="start"
    >
      <SolarTerminatorMap timeZoneId={timeZoneId} date={date} />
      <Separator orientation="horizontal" className="bg-primary/10" />
      <TimeZoneDetails
        className="px-2 py-2"
        timeZoneId={timeZoneId}
        date={date}
      />
    </PopoverContent>
  );
}
