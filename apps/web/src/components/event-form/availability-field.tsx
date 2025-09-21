"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AvailabilityOption = "busy" | "free";

interface AvailabilityFieldProps {
  id: string;
  value: AvailabilityOption;
  onChange: (value: AvailabilityOption) => void;
  disabled?: boolean;
}

export function AvailabilityField({
  id,
  value,
  onChange,
  disabled,
}: AvailabilityFieldProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-8 ps-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="busy">Busy</SelectItem>
        <SelectItem value="free">Free</SelectItem>
      </SelectContent>
    </Select>
  );
}
