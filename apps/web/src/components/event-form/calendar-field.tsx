import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { PopoverTrigger } from "@/components/ui/popover";
import type { Calendar } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  CalendarColorIndicator,
  CalendarListPicker,
} from "./calendar-list-picker";

interface CalendarFieldProps {
  id: string;
  className?: string;
  value: { accountId: string; calendarId: string };
  onChange: (calendar: { accountId: string; calendarId: string }) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export function CalendarField({
  id,
  className,
  value,
  onChange,
  onBlur,
  disabled,
}: CalendarFieldProps) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());

  const items = React.useMemo(() => {
    return data?.accounts ?? [];
  }, [data]);

  const onSelect = React.useCallback(
    (calendar: Calendar) => {
      onChange({ accountId: calendar.accountId, calendarId: calendar.id });
      onBlur();
    },
    [onChange, onBlur],
  );

  const selected = React.useMemo(() => {
    return data?.accounts
      .flatMap((item) => item.calendars)
      .find((item) => item.id === value.calendarId);
  }, [data, value]);

  return (
    <CalendarListPicker items={items} onSelect={onSelect} value={selected}>
      <PopoverTrigger
        id={id}
        className={cn(
          "flex h-8 w-full items-center gap-2 font-medium",
          className,
        )}
        disabled={disabled}
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
