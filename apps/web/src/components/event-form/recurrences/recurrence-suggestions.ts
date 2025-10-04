import { Temporal } from "temporal-polyfill";

import { Recurrence, Weekday } from "@/lib/interfaces";

const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

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

interface GenerateRecurrenceSuggestionsOptions {
  date: Temporal.ZonedDateTime;
  locale: string;
}

export function generateRecurrenceSuggestions({
  date,
  locale,
}: GenerateRecurrenceSuggestionsOptions): RecurrenceOptionGroup[] {
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
