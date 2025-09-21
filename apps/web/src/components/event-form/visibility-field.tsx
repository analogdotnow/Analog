import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type VisibilityOption =
  | "default"
  | "public"
  | "private"
  | "confidential";

const BASE_OPTIONS: { value: VisibilityOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

const CONFIDENTIAL_OPTION: {
  value: VisibilityOption;
  label: string;
} = { value: "confidential", label: "Confidential" };

interface VisibilityFieldProps {
  id: string;
  value: VisibilityOption;
  onChange: (value: VisibilityOption) => void;
  disabled?: boolean;
  showConfidential?: boolean;
}

export function VisibilityField({
  id,
  value,
  onChange,
  disabled,
  showConfidential,
}: VisibilityFieldProps) {
  const options = React.useMemo(() => {
    const baseOptions = showConfidential
      ? [...BASE_OPTIONS, CONFIDENTIAL_OPTION]
      : BASE_OPTIONS;

    // Always include the current value in options to prevent empty Select display
    if (
      value === "confidential" &&
      !baseOptions.some((opt) => opt.value === "confidential")
    ) {
      return [...baseOptions, CONFIDENTIAL_OPTION];
    }

    return baseOptions;
  }, [showConfidential, value]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger id={id} className="h-8 ps-8">
        {value !== "default" && <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
