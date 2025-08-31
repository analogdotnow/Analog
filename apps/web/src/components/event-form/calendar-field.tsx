import * as React from "react";

import { Button } from "@/components/ui/button";
import { PopoverTrigger } from "@/components/ui/popover";
import type { Calendar } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import {
  CalendarColorIndicator,
  CalendarListPicker,
  CalenderAccount,
} from "./calendar-list-picker";

interface CalendarFieldProps {
  id: string;
  className?: string;
  items: CalenderAccount[];
  value: { accountId: string; calendarId: string };
  onChange: (calendar: { accountId: string; calendarId: string }) => void;
  disabled?: boolean;
}

export function CalendarField({
  id,
  className,
  value,
  onChange,
  disabled,
  items,
  ...props
}: CalendarFieldProps) {
  const onSelect = React.useCallback(
    (calendar: Calendar) => {
      onChange({ accountId: calendar.accountId, calendarId: calendar.id });
    },
    [onChange],
  );

  const selected = React.useMemo(() => {
    return items
      .flatMap((item) => item.calendars)
      .find((item) => item.id === value.calendarId);
  }, [items, value]);

  return (
    <CalendarListPicker items={items} onSelect={onSelect} value={selected}>
      <PopoverTrigger
        id={id}
        className={cn(
          "flex h-8 w-full items-center gap-2 font-medium",
          className,
        )}
        disabled={disabled}
        {...props}
        asChild
      >
        <Button
          variant="ghost"
          className="grow justify-start text-sm hover:bg-input-focus focus:bg-input-focus focus-visible:bg-input-focus dark:hover:bg-input-focus dark:focus:bg-input-focus dark:focus-visible:bg-input-focus"
        >
          <CalendarColorIndicator
            primary={selected?.primary ?? false}
            calendarId={selected?.id ?? ""}
            accountId={selected?.accountId ?? ""}
            disabled={disabled}
          />
          {selected?.name}
        </Button>
      </PopoverTrigger>
    </CalendarListPicker>
  );
}
