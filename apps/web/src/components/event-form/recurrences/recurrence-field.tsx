import * as React from "react";
import { useAtomValue } from "jotai";
import { RRuleTemporal } from "rrule-temporal";
import { toText } from "rrule-temporal/totext";
import { Temporal } from "temporal-polyfill";

import { Recurrence } from "@repo/providers/interfaces";
import { toZonedDateTime } from "@repo/temporal";

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

interface RecurrenceFieldProps {
  className?: string;
  id?: string;
  date: Temporal.ZonedDateTime;
  timeZone?: string;
  value: Recurrence | undefined;
  onChange: (value: Recurrence) => void;
  onBlur: () => void;
  disabled?: boolean;
  recurringEventId?: string;
}

export function RecurrenceField({
  className,
  id,
  date,
  value,
  timeZone = "UTC",
  onChange,
  onBlur,
  disabled,
  recurringEventId,
}: RecurrenceFieldProps) {
  const { locale } = useAtomValue(calendarSettingsAtom);
  const options = generateRecurrenceSuggestions({ date, locale });

  const { description, rrule } = React.useMemo(() => {
    if (!value || !value.freq) {
      return { description: undefined, rrule: undefined, rule: undefined };
    }

    const { freq, until, rDate, exDate, ...params } = value;

    const rule = new RRuleTemporal({
      ...params,
      freq,
      rDate: rDate?.map((date) => toZonedDateTime(date, { timeZone })),
      exDate: exDate?.map((date) => toZonedDateTime(date, { timeZone })),
      until: until ? toZonedDateTime(until, { timeZone }) : undefined,
      dtstart: date,
    });

    return {
      description: toText(rule),
      rule,
      rrule: rule.toString(),
    };
  }, [date, value, timeZone]);

  return (
    <DropdownMenu>
      <RecurrenceDialog start={date} recurrence={value} onChange={onChange}>
        <DropdownMenuTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            disabled={disabled || !!recurringEventId}
            className={cn("flex h-8 w-full justify-start", className)}
            onBlur={onBlur}
          >
            <span className="line-clamp-1 truncate text-sm">
              {recurringEventId ? "Recurring" : (description ?? "Repeat")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-64" align="end">
          {options.map((option) => (
            <DropdownMenuGroup key={option.id}>
              <DropdownMenuLabel>{option.label}</DropdownMenuLabel>
              {option.items.map((item) => (
                <DropdownMenuItem
                  className={cn(item.rrule === rrule && "bg-accent")}
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
