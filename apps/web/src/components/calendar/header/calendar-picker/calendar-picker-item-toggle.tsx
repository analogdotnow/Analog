"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { calendarColorVariable } from "@/lib/css";
import { cn } from "@/lib/utils";
import { useCalendarPickerItem } from "./calendar-picker-item-provider";

interface CalendarPickerItemToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function CalendarPickerItemToggle({
  checked,
  onCheckedChange,
}: CalendarPickerItemToggleProps) {
  "use memo";

  const { calendar } = useCalendarPickerItem();

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      style={{
        "--calendar-color": `var(${calendarColorVariable(calendar.provider.accountId, calendar.id)}, var(--color-muted-foreground))`,
      }}
      className={cn(
        "peer size-3 shrink-0 rounded-[4px] shadow-xs transition-shadow dark:border-neutral-700",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-primary",
        "bg-(--calendar-color)/40 data-[state=checked]:bg-(--calendar-color) dark:aria-invalid:ring-destructive/40",
        calendar.primary &&
          "outline-2 outline-offset-2 outline-(--calendar-color)",
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      />
    </CheckboxPrimitive.Root>
  );
}
