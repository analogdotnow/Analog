"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

interface EndIntervalFieldProps {
  value: number;
  onValueChange: (value: number | undefined) => void;
}

export function EndIntervalField({
  value,
  onValueChange,
}: EndIntervalFieldProps) {
  return (
    <Input
      id="interval"
      value={value}
      onChange={(e) => onValueChange(e.target.valueAsNumber)}
      className="w-16"
      type="number"
      min={1}
    />
  );
}
