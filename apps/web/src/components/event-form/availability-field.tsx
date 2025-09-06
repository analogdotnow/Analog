import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type AvailabilityOption = "busy" | "free";

interface AvailabilityFieldProps {
  id: string;
  value: AvailabilityOption;
  onChange: (value: AvailabilityOption) => void;
  disabled?: boolean;
}

const AVAILABILITY_OPTIONS = [
  { value: "busy", label: "Busy" },
  { value: "free", label: "Free" },
];

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
          "h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent",
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {AVAILABILITY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
