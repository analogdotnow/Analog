"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

interface EndAfterFieldProps {
  value: number;
  onValueChange: (value: number | undefined) => void;
  disabled?: boolean;
}

export function EndAfterField({
  value,
  onValueChange,
  disabled,
}: EndAfterFieldProps) {
  return (
    <Input
      value={value}
      onChange={(e) =>
        onValueChange(
          e.target.value === "" ? undefined : e.target.valueAsNumber,
        )
      }
      className="ml-2 w-16"
      type="number"
      min={1}
      disabled={disabled}
    />
  );
}
