"use client";

import * as React from "react";

import type { FormConference } from "@/components/event-form/utils/schema";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConferenceDetails } from "./conference-details";

interface LocationConferencePopoverProps {
  conference: FormConference;
  disabled?: boolean;
}

export function LocationConferencePopover({
  conference,
  disabled = false,
}: LocationConferencePopoverProps) {
  if (conference?.type !== "conference") {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="secondary"
            size="sm"
            className="h-7 max-w-36 justify-start truncate border border-white/5 px-2 text-xs"
            disabled={disabled}
          />
        }
      >
        <span className="truncate">{conference.video?.joinUrl.value}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <ConferenceDetails conference={conference} disabled={disabled} />
      </PopoverContent>
    </Popover>
  );
}
