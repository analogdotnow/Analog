import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type VisibilityOption =
  | "default"
  | "public"
  | "private"
  | "confidential";

interface VisibilityFieldProps {
  id: string;
  value: VisibilityOption;
  onChange: (value: VisibilityOption) => void;
  disabled?: boolean;
  showConfidential?: boolean;
}

const BASE_OPTIONS: { value: VisibilityOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];
const CONFIDENTIAL_OPTION: {
  value: VisibilityOption;
  label: string;
} = { value: "confidential", label: "Confidential" };

export function VisibilityField({
  id,
  value,
  onChange,
  disabled,
  showConfidential,
}: VisibilityFieldProps) {
  const options = React.useMemo(() => {
    return showConfidential
      ? [...BASE_OPTIONS, CONFIDENTIAL_OPTION]
      : BASE_OPTIONS;
  }, [showConfidential]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        className={cn(
          "h-8 border-none bg-transparent ps-8 shadow-none dark:bg-transparent",
          value === "default" && "text-muted-foreground/70",
        )}
      >
        <SelectValue />
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
