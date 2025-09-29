"use client";

import * as React from "react";
import { format } from "@formkit/tempo";
import { parseDate as parseLegacyDate } from "chrono-node";
import { useAtomValue } from "jotai";
import { Temporal } from "temporal-polyfill";

import { toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  FocusOutsideEvent,
  InteractOutsideEvent,
  PointerDownOutsideEvent,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseDate(input: string) {
  const date = parseLegacyDate(input);

  if (!date) {
    return undefined;
  }

  return Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

interface FormatDateOptions {
  timeZone: string;
  locale?: string;
}

function formatDate(
  date: Temporal.PlainDate,
  { locale, timeZone }: FormatDateOptions,
) {
  if (!date) {
    return "";
  }

  const legacyDate = toDate(date, { timeZone });

  const isThisYear = date.year === Temporal.Now.plainDateISO(timeZone).year;

  if (!isThisYear) {
    return format(legacyDate, "ddd D MMM YYYY", locale);
  }

  return format(legacyDate, "ddd D MMM", locale);
}

interface DateInputProps {
  className?: string;
  id?: string;
  value: Temporal.ZonedDateTime;
  isAllDay?: boolean;
  onChange: (value: Temporal.ZonedDateTime) => void;
  start?: Temporal.ZonedDateTime;
  disabled?: boolean;
}

export function DateInput({
  className,
  id,
  value,
  isAllDay,
  start,
  onChange,
  disabled,
}: DateInputProps) {
  const { locale } = useAtomValue(calendarSettingsAtom);
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const date = React.useMemo(() => {
    if (isAllDay && start) {
      if (
        Temporal.PlainDate.compare(value.toPlainDate(), start.toPlainDate()) ===
        0
      ) {
        return value.toPlainDate();
      }

      return start.toPlainDate().subtract({ days: 1 });
    }

    return value.toPlainDate();
  }, [value, isAllDay, start]);

  const defaultMonth = React.useMemo(() => {
    return value.toPlainDate().toPlainYearMonth();
  }, [value]);

  const [displayedMonth, setDisplayedMonth] =
    React.useState<Temporal.PlainYearMonth>(date.toPlainYearMonth());

  const [input, setInput] = React.useState(
    formatDate(date, { locale, timeZone: value.timeZoneId }),
  );

  const min = React.useMemo(() => {
    if (!start) {
      return undefined;
    }

    return start.toPlainDate();
  }, [start]);

  React.useEffect(() => {
    setDisplayedMonth(date.toPlainYearMonth());
    setInput(formatDate(date, { locale, timeZone: value.timeZoneId }));
    setOpen(false);
  }, [value, locale, date]);

  const resetInput = React.useCallback(() => {
    setDisplayedMonth(value.toPlainDate().toPlainYearMonth());
    setInput(formatDate(date, { locale, timeZone: value.timeZoneId }));
  }, [date, locale, value]);

  const onComplete = React.useCallback(
    (newDate: Temporal.PlainDate) => {
      const newValue = newDate.toZonedDateTime({
        timeZone: value.timeZoneId,
        plainTime: value.toPlainTime(),
      });

      if (min && Temporal.PlainDate.compare(newDate, min) < 0) {
        return;
      }

      setDisplayedMonth(newDate.toPlainYearMonth());
      setInput(formatDate(newDate, { locale, timeZone: value.timeZoneId }));

      if (isAllDay && start) {
        if (
          Temporal.PlainDate.compare(
            value.toPlainDate(),
            start.toPlainDate(),
          ) === 0
        ) {
          onChange(newValue);

          return;
        }

        onChange(newValue.subtract({ days: 1 }));

        return;
      }

      onChange(newValue);
    },
    [value, min, locale, isAllDay, start, onChange],
  );

  const onInput = React.useCallback(
    (newValue: string) => {
      const date = parseDate(newValue);

      if (!date || (min && Temporal.PlainDate.compare(date, min) < 0)) {
        resetInput();

        return;
      }

      onComplete(date);
    },
    [min, onComplete, resetInput],
  );

  const onInputChange = React.useCallback((newValue: string) => {
    setInput(newValue);

    const date = parseDate(newValue);

    if (!date) {
      return;
    }

    setDisplayedMonth(date.toPlainYearMonth());
  }, []);

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (disabled) {
        return;
      }
      setOpen(open);
    },
    [disabled],
  );

  const onFocus = React.useCallback(() => {
    if (open) {
      return;
    }

    setOpen(true);
  }, [open]);

  const onSelect = React.useCallback(
    (value: Temporal.PlainDate) => {
      React.startTransition(() => {
        if (!value) {
          return;
        }

        onComplete(value);
      });

      setOpen(false);
    },
    [onComplete],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") {
        return;
      }

      setOpen(false);
      onInput(input);
    },
    [onInput, input],
  );

  return (
    <Popover open={open && !disabled} onOpenChange={onOpenChange}>
      <PopoverTrigger ref={triggerRef} className="hidden"></PopoverTrigger>
      <PopoverAnchor asChild>
        <Input
          id={id}
          className={cn(
            "col-span-2 col-start-1 h-8 border-none bg-transparent ps-7 text-sm font-medium md:text-sm dark:bg-transparent",
            // min &&
            //   date &&
            //   sameDay(date, min) &&
            // "text-muted-foreground",
            className,
          )}
          disabled={disabled}
          value={input}
          ref={inputRef}
          onFocus={onFocus}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </PopoverAnchor>
      <DateInputPopoverContent inputRef={inputRef}>
        <TemporalCalendar
          defaultMonth={defaultMonth}
          selected={date}
          month={displayedMonth}
          onMonthChange={setDisplayedMonth}
          min={min}
          onSelect={onSelect}
          timeZone={value.timeZoneId}
        />
      </DateInputPopoverContent>
    </Popover>
  );
}

interface DateInputPopoverContentProps {
  children: React.ReactNode;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function DateInputPopoverContent({
  children,
  inputRef,
}: DateInputPopoverContentProps) {
  const onOutside = React.useCallback(
    (e: PointerDownOutsideEvent | FocusOutsideEvent | InteractOutsideEvent) => {
      if (inputRef.current && inputRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    },
    [inputRef],
  );

  const onOpenAutoFocus = React.useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  return (
    <PopoverContent
      className="w-auto overflow-hidden p-0"
      align="end"
      onOpenAutoFocus={onOpenAutoFocus}
      onPointerDownOutside={onOutside}
      onFocusOutside={onOutside}
      onInteractOutside={onOutside}
    >
      {children}
    </PopoverContent>
  );
}

export const MemoizedDateInput = React.memo(DateInput);

interface TemporalCalendarProps {
  month: Temporal.PlainYearMonth;
  defaultMonth: Temporal.PlainYearMonth;
  onMonthChange: (month: Temporal.PlainYearMonth) => void;
  selected: Temporal.PlainDate;
  onSelect: (date: Temporal.PlainDate) => void;
  timeZone: string;
  min?: Temporal.PlainDate;
}

function TemporalCalendar({
  selected,
  onSelect,
  timeZone,
  month,
  onMonthChange,
  min,
}: TemporalCalendarProps) {
  const legacySelected = React.useMemo(() => {
    return toDate(selected, { timeZone });
  }, [selected, timeZone]);

  const legacyOnSelect = React.useCallback(
    (date: Date) => {
      const plainDate = Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      });

      onSelect(plainDate);
    },
    [onSelect],
  );

  const legacyMonth = React.useMemo(() => {
    const date = month.toPlainDate({ day: 1 });

    return toDate(date, { timeZone });
  }, [month, timeZone]);

  const modifiers = React.useMemo(() => {
    if (!min) {
      return undefined;
    }

    return {
      min: toDate(min, { timeZone }),
    };
  }, [min, timeZone]);

  const legacyOnMonthChange = React.useCallback(
    (date: Date) => {
      const month = Temporal.PlainYearMonth.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });

      onMonthChange(month);
    },
    [onMonthChange],
  );

  return (
    <Calendar
      required
      mode="single"
      selected={legacySelected}
      month={legacyMonth}
      onMonthChange={legacyOnMonthChange}
      modifiers={modifiers}
      onSelect={legacyOnSelect}
    />
  );
}
