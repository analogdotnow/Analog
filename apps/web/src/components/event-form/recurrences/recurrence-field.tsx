import * as React from "react";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { Recurrence } from "@repo/providers/interfaces";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RecurrenceDialog } from "./recurrence-dialog";
import { generateRecurrenceSuggestions } from "./recurrence-suggestions";
import { useRecurrence } from "./use-recurrence";
import { useRecurringEvent } from "./use-recurring-event";

interface RecurrenceFieldProps {
  className?: string;
  id?: string;
  date: Temporal.ZonedDateTime;
  value: Recurrence | null | undefined;
  onChange: (value: Recurrence | null) => void;
  onBlur: () => void;
  disabled?: boolean;
  recurringEventId?: string;
}

export function RecurrenceField({
  className,
  id,
  date,
  value,
  onChange,
  onBlur,
  disabled,
  recurringEventId,
}: RecurrenceFieldProps) {
  const { locale } = useAtomValue(calendarSettingsAtom);
  const options = generateRecurrenceSuggestions({ date, locale });
  const baseEvent = useRecurringEvent(recurringEventId);

  const displayRecurrence = React.useMemo(() => {
    if (value !== undefined) {
      return value;
    }

    return baseEvent?.recurrence;
  }, [value, baseEvent?.recurrence]);

  const timeZone = React.useMemo(() => {
    return date.timeZoneId;
  }, [date]);

  const recurrence = useRecurrence({
    recurrence: displayRecurrence ?? undefined,
    date,
    timeZone,
  });

  return (
    <DropdownMenu>
      <RecurrenceDialog
        start={date}
        recurrence={value ?? undefined}
        onChange={onChange}
      >
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            disabled={disabled || !!recurringEventId}
            className={cn(
              "flex h-8 w-full justify-start focus:bg-accent/80 focus-visible:bg-accent/80 data-[state=open]:bg-accent/80 data-[state=open]:dark:bg-accent/80",
              className,
            )}
            onBlur={onBlur}
          >
            <span
              className={cn(
                "line-clamp-1 truncate text-sm first-letter:capitalize",
                !displayRecurrence && "text-muted-foreground/70",
              )}
            >
              {recurrence.description ??
                (recurringEventId ? "Recurring" : "Repeat")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64" align="end">
          {value ? (
            <>
              <DropdownMenuItem
                onSelect={() => {
                  onChange(null);
                }}
              >
                Do not repeat
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {options.map((option) => (
            <DropdownMenuGroup key={option.id}>
              <DropdownMenuLabel>{option.label}</DropdownMenuLabel>
              {option.items.map((item) => (
                <DropdownMenuItem
                  className={cn(
                    item.rrule === recurrence.rrule && "bg-accent/80",
                  )}
                  key={item.id}
                  onSelect={() => {
                    onChange(item.recurrence);
                  }}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuGroup>
          ))}
          <DialogTrigger asChild>
            <DropdownMenuItem>Custom</DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </RecurrenceDialog>
    </DropdownMenu>
  );
}
