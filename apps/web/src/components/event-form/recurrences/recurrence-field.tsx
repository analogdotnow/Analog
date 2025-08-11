import * as React from "react";
import { useAtomValue } from "jotai";
import { RRuleTemporal } from "rrule-temporal";
import { toText } from "rrule-temporal/totext";
import { Temporal } from "temporal-polyfill";

import { Recurrence, Weekday } from "@repo/api/interfaces";

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

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

interface GenerateRecurrenceOptionsOptions {
  date: Temporal.ZonedDateTime;
  locale: string;
}

interface RecurrenceOption {
  id: string;
  label: string;
  rrule: string;
  recurrence: Recurrence;
}

interface RecurrenceOptionGroup {
  id: string;
  label: string;
  items: RecurrenceOption[];
}

function generateRecurrenceOptions({
  date,
  locale,
}: GenerateRecurrenceOptionsOptions): RecurrenceOptionGroup[] {
  return [
    {
      id: "every-day",
      label: "Daily",
      items: [
        {
          id: "every-day",
          label: "Every day",
          recurrence: { freq: "DAILY" },
          rrule: `RRULE:FREQ=DAILY`,
        },
        {
          id: "every-weekday",
          label: "Every weekday",
          recurrence: {
            freq: "WEEKLY",
            byDay: ["MO", "TU", "WE", "TH", "FR"],
          },
          rrule: `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`,
        },
        {
          id: "every-specific-day",
          label: `Every ${date.toLocaleString(locale, { weekday: "long" })}`,
          recurrence: {
            freq: "WEEKLY",
            byDay: [WEEKDAYS[date.dayOfWeek - 1] as Weekday],
          },
          rrule: `RRULE:FREQ=WEEKLY;BYDAY=${WEEKDAYS[date.dayOfWeek - 1]}`,
        },
        {
          id: "every-other-specific-day",
          label: `Every other ${date.toLocaleString(locale, { weekday: "long" })}`,
          recurrence: {
            freq: "WEEKLY",
            interval: 2,
            byDay: [WEEKDAYS[date.dayOfWeek - 1] as Weekday],
          },
          rrule: `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${WEEKDAYS[date.dayOfWeek - 1]}`,
        },
      ],
    },
    {
      id: "monthly",
      label: "Monthly",
      items: [
        {
          id: "every-month-on-specific-day",
          label: `Every month on the ${date.day}${getOrdinalSuffix(date.day)}`,
          recurrence: {
            freq: "MONTHLY",
            byMonthDay: [date.day],
          },
          rrule: `RRULE:FREQ=MONTHLY;BYMONTHDAY=${date.day}`,
        },
        {
          id: "every-month-on-specific-day-and-weekday",
          label: `Every month on the ${Math.ceil(date.day / 7)}${getOrdinalSuffix(Math.ceil(date.day / 7))} ${date.toLocaleString(locale, { weekday: "long" })}`,
          recurrence: {
            freq: "MONTHLY",
            byDay: [WEEKDAYS[date.dayOfWeek - 1] as Weekday],
            bySetPos: [Math.ceil(date.day / 7)],
          },
          rrule: `RRULE:FREQ=MONTHLY;BYDAY=${WEEKDAYS[date.dayOfWeek - 1]};BYSETPOS=${Math.ceil(date.day / 7)}`,
        },
      ],
    },
    {
      id: "yearly",
      label: "Yearly",
      items: [
        {
          id: "every-year-on-specific-day",
          label: `Every year on ${date.toLocaleString(locale, { month: "long", day: "numeric" })}`,
          recurrence: {
            freq: "YEARLY",
            byMonth: [date.month],
            byMonthDay: [date.day],
          },
          rrule: `RRULE:FREQ=YEARLY;BYMONTH=${date.month};BYMONTHDAY=${date.day}`,
        },
      ],
    },
  ];
}

function getOrdinalSuffix(day: number) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

interface RecurrenceFieldProps {
  className?: string;
  id?: string;
  date: Temporal.ZonedDateTime;
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
  onChange,
  onBlur,
  disabled,
  recurringEventId,
}: RecurrenceFieldProps) {
  const { locale } = useAtomValue(calendarSettingsAtom);
  const options = generateRecurrenceOptions({ date, locale });

  const { description, rule, rrule } = React.useMemo(() => {
    if (!value) {
      return { description: undefined, rrule: undefined, rule: undefined };
    }

    const { until, rDate, exDate, ...rest } = value;

    const rule = new RRuleTemporal({
      ...rest,
      dtstart: date,
    });

    return {
      description: toText(rule),
      rule,
      rrule: rule.toString(),
    };
  }, [date, value]);

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
