import { Temporal } from "temporal-polyfill";

import { endOfWeek, isSameMonth, startOfWeek } from "@repo/temporal";

import { AGENDA_DAYS_TO_DISPLAY } from "@/components/calendar/constants";
import type { CalendarView } from "@/components/calendar/interfaces";
import { format } from "@/lib/utils/format";

interface GetMonthTitleOptions {
  timeZone: string;
  variant: "full" | "short";
}

function getMonthTitle(
  date: Temporal.PlainDate,
  options: GetMonthTitleOptions,
) {
  if (options.variant === "full") {
    return format(date, "MMMM YYYY", options.timeZone);
  }

  return format(date, "MMM YYYY", options.timeZone);
}

interface GetWeekTitleOptions {
  timeZone: string;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  variant: "full" | "short";
}

function getWeekTitle(date: Temporal.PlainDate, options: GetWeekTitleOptions) {
  const start = startOfWeek(date, { weekStartsOn: options.weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn: options.weekStartsOn });

  if (isSameMonth(start, end)) {
    return getMonthTitle(start, options);
  }

  if (options.variant === "full") {
    return `${format(start, "MMM", options.timeZone)} - ${format(end, "MMM YYYY", options.timeZone)}`;
  }

  return `${format(start, "MMM", options.timeZone)} - ${format(end, "MMM", options.timeZone)}`;
}

interface GetDayTitleOptions {
  timeZone: string;
  variant: "full" | "short";
}

function getDayTitle(date: Temporal.PlainDate, options: GetDayTitleOptions) {
  if (options.variant === "full") {
    return format(date, "ddd MMMM D, YYYY", options.timeZone);
  }

  return format(date, "MMM D, YYYY", options.timeZone);
}

interface GetAgendaTitleOptions {
  timeZone: string;
  variant: "full" | "short";
}

function getAgendaTitle(
  date: Temporal.PlainDate,
  options: GetAgendaTitleOptions,
) {
  const end = date.add({ days: AGENDA_DAYS_TO_DISPLAY - 1 });

  if (isSameMonth(date, end)) {
    return getMonthTitle(date, options);
  }

  if (options.variant === "full") {
    return `${format(date, "MMM", options.timeZone)} - ${format(end, "MMM YYYY", options.timeZone)}`;
  }

  return `${format(date, "MMM", options.timeZone)} - ${format(end, "MMM", options.timeZone)}`;
}

interface CalendarTitleOptions {
  view: CalendarView;
  timeZone: string;
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  variant: "full" | "short";
}

export function calendarTitle(
  currentDate: Temporal.PlainDate,
  options: CalendarTitleOptions,
) {
  switch (options.view) {
    case "month":
      return getMonthTitle(currentDate, options);
    case "week":
      return getWeekTitle(currentDate, options);
    case "day":
      return getDayTitle(currentDate, options);
    case "agenda":
      return getAgendaTitle(currentDate, options);
    default:
      return getMonthTitle(currentDate, options);
  }
}
