import * as React from "react";
import { useAtomValue } from "jotai";
import { RRuleTemporal } from "rrule-temporal";
import { toText } from "rrule-temporal/totext";
import { Temporal } from "temporal-polyfill";

import { Recurrence } from "@repo/api/interfaces";
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
import { useLiveEventById } from "@/lib/db";
import { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { RecurrenceDialog } from "./recurrence-dialog";
import { generateRecurrenceSuggestions } from "./recurrence-suggestions";

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

type BaseEvent = Omit<CalendarEvent, "recurrence"> &
  Required<Pick<CalendarEvent, "recurrence">>;

function useBaseEvent(recurringEventId?: string) {
  const event = useLiveEventById(recurringEventId ?? "");

  return React.useMemo(() => {
    if (!recurringEventId) {
      return undefined;
    }

    return event as
        | BaseEvent
        | undefined;
  }, [event, recurringEventId]);
}

interface UseRecurrenceOptions {
  recurrence: Recurrence | undefined;
  date: Temporal.ZonedDateTime;
  timeZone: string;
}

function useRecurrence({ recurrence, date, timeZone }: UseRecurrenceOptions) {
  return React.useMemo(() => {
    if (!recurrence) {
      return { description: undefined, rrule: undefined, rule: undefined };
    }

    const { until, rDate, exDate, ...params } = recurrence;

    const rule = new RRuleTemporal({
      ...params,
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
  }, [date, recurrence, timeZone]);
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
  const masterEvent = useBaseEvent(recurringEventId);

  const displayRecurrence = React.useMemo(() => {
    if (value !== undefined) {
      return value;
    }

    return masterEvent?.recurrence;
  }, [value, masterEvent?.recurrence]);

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
              "flex h-8 w-full justify-start focus:bg-input-focus focus-visible:bg-input-focus data-[state=open]:bg-input-focus data-[state=open]:dark:bg-input-focus",
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
                  className={cn(item.rrule === recurrence.rrule && "bg-accent")}
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
