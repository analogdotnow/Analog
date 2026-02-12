"use client";

import * as React from "react";
import { CheckIcon } from "@heroicons/react/16/solid";
import { useVirtualizer } from "@tanstack/react-virtual";

import { TimeZoneAwareGlobeIcon } from "@/components/timezone-aware-globe-icon";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeZoneDisplayValue } from "@/lib/timezones";
import { cn } from "@/lib/utils";
import { useTimezoneList, useTimezoneSearch } from "./use-timezone-list";

interface TimezoneListItemProps {
  item: TimeZoneDisplayValue;
  value: string;
  onSelect: (value: string) => void;
  start: number;
}

function TimezoneListItem({
  item,
  value,
  onSelect,
  start,
}: TimezoneListItemProps) {
  const style = React.useMemo(() => {
    return {
      transform: `translateY(${start}px)`,
    };
  }, [start]);

  return (
    <CommandItem
      key={item.id}
      value={item.id}
      onSelect={onSelect}
      className="absolute top-0 left-0 flex w-full text-sm tabular-nums [&_svg]:size-3.5"
      style={style}
    >
      <span className="line-clamp-1 flex-none">
        <span className="inline-block w-20 text-muted-foreground/80">
          {item.offset.label.long}
        </span>
      </span>
      <span className="grow truncate">{item.fullName}</span>
      <span className="flex-none text-muted-foreground/80">
        ({item.abbreviation})
      </span>
      {value === item.id ? <CheckIcon className="ml-auto" /> : null}
    </CommandItem>
  );
}

const MemoizedTimezoneList = React.memo(TimezoneList);

interface TimezoneInputProps {
  id?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isDirty?: boolean;
}

export function TimezoneInput({
  id,
  className,
  value,
  onChange,
  disabled,
}: TimezoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { timezones, displayValue } = useTimezoneList(value);

  const searchResults = useTimezoneSearch({ timezones, search });

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (disabled) {
        return;
      }
      setOpen(open);
    },
    [disabled],
  );

  const onSelect = React.useCallback(
    (value: string) => {
      onChange(value);
      setOpen(false);
    },
    [onChange, setOpen],
  );

  return (
    <div className="flex flex-1">
      <Popover open={open && !disabled} onOpenChange={onOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="ghost"
              size="sm"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-start gap-2 px-2 data-[state=open]:bg-accent-light",
                className,
              )}
              disabled={disabled}
            />
          }
        >
          <TimeZoneAwareGlobeIcon
            offset={displayValue?.offset.value ?? 0}
            className="size-4 text-muted-foreground/60"
          />
          <span className="text-muted-foreground/80">
            {displayValue.offset.label.short}
          </span>
          {displayValue.city ?? displayValue.name}
        </PopoverTrigger>
        <PopoverContent
          className="max-w-screen min-w-(--anchor-width) p-0"
          align="start"
          side="top"
          sideOffset={4}
        >
          <Command shouldFilter={false} value={value}>
            <CommandInput
              placeholder="Search timezone..."
              className="h-8 p-0 text-sm"
              onValueChange={setSearch}
            />
            <CommandList className="max-h-48">
              <CommandEmpty>No timezone found.</CommandEmpty>
              <MemoizedTimezoneList
                timezones={searchResults}
                value={value}
                onSelect={onSelect}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface TimezoneListProps {
  timezones: TimeZoneDisplayValue[];
  value: string;
  onSelect: (value: string) => void;
}

function TimezoneList({ timezones, value, onSelect }: TimezoneListProps) {
  "use no memo";
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  // Roughly estimate each row height – 32px covers typical list item.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: timezones.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 6, // render a few extra rows for smoother scrolling
  });

  return (
    <CommandGroup className="py-1">
      <div ref={parentRef} className="max-h-48 overflow-y-auto">
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <TimezoneListItem
              key={virtualRow.key}
              item={timezones[virtualRow.index]!}
              value={value}
              onSelect={onSelect}
              start={virtualRow.start}
            />
          ))}
        </div>
      </div>
    </CommandGroup>
  );
}

export const MemoizedTimezoneInput = React.memo(TimezoneInput);
