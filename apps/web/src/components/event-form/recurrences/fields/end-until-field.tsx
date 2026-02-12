"use client";

import * as React from "react";
import { format, sameYear } from "@formkit/tempo";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatDate(date: Date) {
  return format(
    date,
    sameYear(date, new Date()) ? "ddd MMM DD, YYYY" : "ddd MMM DD",
  );
}

interface UntilPopoverTriggerProps {
  value: Date;
  disabled?: boolean;
}

export function UntilPopoverTrigger({
  value,
  disabled,
}: UntilPopoverTriggerProps) {
  return (
    <PopoverTrigger
      render={
        <Button
          variant="outline"
          className={cn(
            "ml-2 justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
        />
      }
    >
      {value ? formatDate(value) : "Select date"}
    </PopoverTrigger>
  );
}

interface EndUntilFieldProps {
  value: Date;
  onValueChange: (value: Date | undefined) => void;
  min: Date;
  disabled?: boolean;
}

export function EndUntilField({
  value,
  onValueChange,
  min,
  disabled,
}: EndUntilFieldProps) {
  return (
    <Popover>
      <UntilPopoverTrigger value={value} disabled={disabled} />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onValueChange}
          modifiers={{
            min,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
