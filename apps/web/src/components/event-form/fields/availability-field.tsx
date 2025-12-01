"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AvailabilityFieldProps {
  id: string;
  value: "busy" | "free";
  onChange: (value: "busy" | "free") => void;
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
      <SelectTrigger
        id={id}
        className={cn(
          "h-8 ps-8 pe-1.5",
          value === "busy" && "text-muted-foreground/60",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="busy">Busy</SelectItem>
        <SelectItem value="free">Free</SelectItem>
      </SelectContent>
    </Select>
  );
}
