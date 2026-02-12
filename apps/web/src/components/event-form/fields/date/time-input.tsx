"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { parseDate } from "chrono-node";
import { Temporal } from "temporal-polyfill";

import {
  Combobox,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
} from "@/components/ui/combobox";
import { formatTime } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";
import { TimeInputValue, useTimeSuggestions } from "./use-time-suggestions";

interface TimeInputListItemProps {
  item: TimeInputValue;
  onSelect: (value: string) => void;
  start: number;
}

function TimeInputListItem({ item, onSelect, start }: TimeInputListItemProps) {
  const style = React.useMemo(() => {
    return {
      transform: `translateY(${start}px)`,
    };
  }, [start]);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      onSelect(item.label);
    },
    [item.label, onSelect],
  );

  return (
    <ComboboxItem
      key={item.key}
      value={item.label}
      className="absolute left-0 w-full ps-7 text-sm font-medium tabular-nums"
      onClick={onClick}
      style={style}
    />
  );
}

const MemoizedTimeInputList = React.memo(TimeInputList);

interface TimeInputProps {
  className?: string;
  id?: string;
  value: Temporal.ZonedDateTime;
  onChange: (value: Temporal.ZonedDateTime) => void;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimeInput({
  className,
  id,
  value,
  onChange,
  disabled,
  open,
  onOpenChange,
}: TimeInputProps) {
  const use12Hour = useCalendarStore((s) => s.calendarSettings.use12Hour);
  const locale = useCalendarStore((s) => s.calendarSettings.locale);
  const [input, setInput] = React.useState(
    formatTime({ value, use12Hour, locale }),
  );

  const [searchValue, setSearchValue] = React.useState("");
  const suggestions = useTimeSuggestions(searchValue);

  React.useEffect(() => {
    setInput(formatTime({ value, use12Hour, locale }));
    setSearchValue("");
    onOpenChange(false);
    // Intentionally omit setIsOpen from deps to avoid effect firing on parent callback identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, use12Hour, locale, setSearchValue]);

  const onComplete = React.useCallback(
    (newValue: string) => {
      const date = parseDate(newValue);

      if (!date) {
        setInput(formatTime({ value, use12Hour, locale }));
        setSearchValue("");
        onOpenChange(false);
        return;
      }

      const dateTime = value.withPlainTime({
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds(),
      });

      setInput(formatTime({ value: dateTime, use12Hour, locale }));
      setSearchValue("");
      onOpenChange(false);
      onChange(dateTime);
    },
    [use12Hour, locale, value, onChange, onOpenChange, setSearchValue],
  );

  const onInputChange = React.useCallback((newValue: string) => {
    setSearchValue(newValue);
    setInput(newValue);
  }, []);

  const onInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onComplete(e.target.value);
    },
    [onComplete],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") {
        return;
      }

      onComplete(input);
    },
    [onComplete, input],
  );

  return (
    <Combobox
      open={open}
      setOpen={onOpenChange}
      value={input}
      setValue={onInputChange}
    >
      <ComboboxLabel className="sr-only">Time</ComboboxLabel>
      <ComboboxInput
        id={id}
        className={className}
        onChange={onInput}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <MemoizedTimeInputList
        value={value}
        searchValue={searchValue}
        suggestions={suggestions}
        onSelect={onComplete}
      />
    </Combobox>
  );
}

interface TimeInputListProps {
  value: Temporal.ZonedDateTime;
  suggestions: TimeInputValue[];
  searchValue: string;
  onSelect: (value: string) => void;
}

function TimeInputList({ suggestions, onSelect }: TimeInputListProps) {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: suggestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 6,
  });

  return (
    <ComboboxPopover
      className="max-h-64 overflow-y-auto"
      ref={parentRef}
      autoFocusOnHide={false}
    >
      <div
        className="relative w-full"
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = suggestions[virtualRow.index]!;

          return (
            <TimeInputListItem
              key={item.key}
              item={item}
              onSelect={onSelect}
              start={virtualRow.start}
            />
          );
        })}
      </div>
    </ComboboxPopover>
  );
}

export const MemoizedTimeInput = React.memo(TimeInput);
