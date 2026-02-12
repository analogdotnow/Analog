"use client";

import * as React from "react";

import { Weekday } from "@repo/providers/interfaces";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface DayOfWeekItem {
  short: string;
  full: string;
  value: Weekday;
}

const daysOfWeek: DayOfWeekItem[] = [
  { short: "Mon", full: "Monday", value: "MO" },
  { short: "Tue", full: "Tuesday", value: "TU" },
  { short: "Wed", full: "Wednesday", value: "WE" },
  { short: "Thu", full: "Thursday", value: "TH" },
  { short: "Fri", full: "Friday", value: "FR" },
  { short: "Sat", full: "Saturday", value: "SA" },
  { short: "Sun", full: "Sunday", value: "SU" },
];

interface DayOfWeekFieldProps {
  value: Weekday[];
  onValueChange: (value: Weekday[]) => void;
}

export function DayOfWeekField({ value, onValueChange }: DayOfWeekFieldProps) {
  return (
    <ToggleGroup
      variant="outline"
      multiple
      value={value ?? []}
      onValueChange={(v: Weekday[]) => onValueChange(v)}
      className="w-full"
    >
      {daysOfWeek.map((day) => (
        <ToggleGroupItem
          key={day.value}
          value={day.value}
          aria-label={day.full}
        >
          {day.short}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
