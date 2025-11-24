"use client";

import * as React from "react";

import { Weekday } from "@repo/providers/interfaces";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const daysOfWeek = [
  { short: "Mon", full: "Monday", value: "mo" },
  { short: "Tue", full: "Tuesday", value: "tu" },
  { short: "Wed", full: "Wednesday", value: "we" },
  { short: "Thu", full: "Thursday", value: "th" },
  { short: "Fri", full: "Friday", value: "fr" },
  { short: "Sat", full: "Saturday", value: "sa" },
  { short: "Sun", full: "Sunday", value: "su" },
];

interface DayOfWeekFieldProps {
  value: Weekday[];
  onValueChange: (value: Weekday[]) => void;
}

export function DayOfWeekField({ value, onValueChange }: DayOfWeekFieldProps) {
  return (
    <ToggleGroup
      variant="outline"
      type="multiple"
      value={value ?? []}
      onValueChange={(v) => onValueChange(v as Weekday[])}
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
