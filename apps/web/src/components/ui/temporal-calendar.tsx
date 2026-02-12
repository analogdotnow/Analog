"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import {
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "@repo/temporal";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { useDefaultTimeZone } from "@/store/hooks";

interface NavPreviousProps {
  onClick: () => void;
}

function NavPrevious({ onClick }: NavPreviousProps) {
  return (
    <Button
      variant="ghost"
      className="absolute left-0 size-7 bg-transparent p-0 opacity-80 hover:opacity-100 dark:hover:bg-neutral-700/90"
      type="button"
      aria-label="Go to previous month"
      onClick={onClick}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}

interface NavNextProps {
  onClick: () => void;
}

function NavNext({ onClick }: NavNextProps) {
  return (
    <Button
      variant="ghost"
      className="absolute right-0 size-7 bg-transparent p-0 opacity-80 hover:opacity-100 dark:hover:bg-neutral-700/90"
      type="button"
      aria-label="Go to next month"
      onClick={onClick}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}

interface CaptionProps {
  children: React.ReactNode;
}

function Caption({ children }: CaptionProps) {
  "use memo";

  return <span className="truncate text-sm font-medium">{children}</span>;
}

interface DayCellProps {
  date: Temporal.PlainDate;
  month: Temporal.PlainYearMonth;
  timeZone: string;
  locale: string;
  onSelect: (date: Temporal.PlainDate) => void;
}

function DayCell({ date, month, timeZone, locale, onSelect }: DayCellProps) {
  "use memo";

  return (
    <div
      role="gridcell"
      className="group/day flex size-8 items-center justify-center text-sm"
      style={{
        backgroundColor: `var(--background-day-${date.toString()})`,
        borderRadius: `var(--radius-day-${date.toString()})`,
      }}
      data-today={isToday(date, { timeZone }) || undefined}
      data-outside={!isSameMonth(date, month) || undefined}
    >
      <Button
        variant="ghost"
        className={cn(
          "size-7 rounded-md p-0 font-normal transition-none",
          "group-data-today/day:border group-data-today/day:border-blue-600 group-data-today/day:bg-linear-to-b group-data-today/day:from-blue-500 group-data-today/day:to-blue-600 group-data-today/day:text-blue-50",
          "group-data-selected/day:bg-primary group-data-selected/day:text-primary-foreground",
          "group-data-selected/day:hover:bg-primary group-data-selected/day:dark:hover:bg-primary/80",
          "group-data-selected/day:hover:text-primary-foreground",
          "group-data-outside/day:text-muted-foreground group-data-outside/day:opacity-50",
        )}
        type="button"
        aria-label={format(date, "dddd, MMMM D, YYYY", timeZone, locale)}
        onClick={() => onSelect(date)}
      >
        {date.day}
      </Button>
    </div>
  );
}

const MemoizedDayCell = React.memo(DayCell);

interface MonthGridProps {
  month: Temporal.PlainYearMonth;
  onSelect: (date: Temporal.PlainDate) => void;
}

function MonthGrid({ month, onSelect }: MonthGridProps) {
  "use memo";

  const timeZone = useDefaultTimeZone();
  const locale = useCalendarStore((s) => s.calendarSettings.locale);
  const weekStartsOn = useCalendarStore((s) => s.calendarSettings.weekStartsOn);

  const weekdayNames = getWeekdayNames(weekStartsOn, timeZone, locale);

  const weeks = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(month.toPlainDate({ day: 1 })), {
      weekStartsOn,
    });

    // We always show 42 days in the grid (7 days per week * 6 weeks)
    const end = start.add({ days: 41 });

    const days = eachDayOfInterval(start, end);

    const weeks: Temporal.PlainDate[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [weekStartsOn, month]);

  return (
    <div role="grid" className="mt-4" aria-label="Calendar">
      <div role="row" className="grid grid-cols-7">
        {weekdayNames.map((name, i) => (
          <div
            key={i}
            role="columnheader"
            className="flex size-8 items-center justify-center text-sm font-normal text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} role="row" className="grid grid-cols-7">
          {week.map((day) => (
            <MemoizedDayCell
              key={day.toString()}
              date={day}
              month={month}
              timeZone={timeZone}
              locale={locale}
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const MemoizedMonthGrid = React.memo(MonthGrid);

function getWeekdayNames(
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  timeZone: string,
  locale: string,
) {
  const today = Temporal.Now.plainDateISO(timeZone);
  const weekStart = startOfWeek(today, { weekStartsOn });

  return Array.from({ length: 7 }, (_, i) =>
    format(weekStart.add({ days: i }), "d", timeZone, locale),
  );
}

interface TemporalCalendarProps {
  className?: string;
  defaultMonth?: Temporal.PlainYearMonth;
  ref?: React.RefObject<HTMLDivElement | null>;
}

export function TemporalCalendar({
  className,
  defaultMonth = Temporal.Now.plainDateISO().toPlainYearMonth(),
  ref,
}: TemporalCalendarProps) {
  "use memo";

  const timeZone = useDefaultTimeZone();
  const locale = useCalendarStore((s) => s.calendarSettings.locale);
  const navigateTo = useCalendarStore((s) => s.navigateTo);

  const [month, setMonth] =
    React.useState<Temporal.PlainYearMonth>(defaultMonth);

  React.useEffect(() => {
    setMonth(defaultMonth);
  }, [defaultMonth]);

  const caption = format(
    month.toPlainDate({ day: 1 }),
    "MMMM YYYY",
    timeZone,
    locale,
  );

  const onPreviousMonth = () => {
    setMonth((prev) => prev.subtract({ months: 1 }));
  };

  const onNextMonth = () => {
    setMonth((prev) => prev.add({ months: 1 }));
  };

  const onDateSelect = (date: Temporal.PlainDate) => {
    navigateTo(date);

    if (!isSameMonth(date, month)) {
      setMonth(date.toPlainYearMonth());
    }
  };

  return (
    <div ref={ref} className={cn("w-fit", className)}>
      <div className="relative mx-1.5 flex h-8 items-center justify-center">
        <NavPrevious onClick={onPreviousMonth} />
        <Caption>{caption}</Caption>
        <NavNext onClick={onNextMonth} />
      </div>
      <MemoizedMonthGrid month={month} onSelect={onDateSelect} />
    </div>
  );
}
