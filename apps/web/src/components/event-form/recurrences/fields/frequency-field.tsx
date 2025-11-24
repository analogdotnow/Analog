"use client";

import * as React from "react";

import { Frequency } from "@repo/providers/interfaces";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FrequencyFieldProps {
  value: Frequency;
  onValueChange: (value: Frequency) => void;
}

export function FrequencyField({ value, onValueChange }: FrequencyFieldProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as Frequency)}>
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DAILY">Day</SelectItem>
        <SelectItem value="WEEKLY">Week</SelectItem>
        <SelectItem value="MONTHLY">Month</SelectItem>
        <SelectItem value="YEARLY">Year</SelectItem>
      </SelectContent>
    </Select>
  );
}
