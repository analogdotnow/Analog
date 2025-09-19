import * as React from "react";
import {
  CheckIcon,
  GlobeAmericasIcon,
  GlobeAsiaAustraliaIcon,
  GlobeEuropeAfricaIcon,
} from "@heroicons/react/16/solid";
import { useVirtualizer } from "@tanstack/react-virtual";
import { matchSorter } from "match-sorter";
import { Temporal } from "temporal-polyfill";

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
import {
  TIMEZONES_DISPLAY,
  TimeZoneDisplayValue,
  getDisplayValue,
} from "@/lib/timezones";
import { cn } from "@/lib/utils";
import { TimeZoneAwareGlobeIcon } from "./timezone-aware-globe-icon";

function useTimezoneList(value: string) {
  return React.useMemo(() => {
    if (!value) {
      const timezone = TIMEZONES_DISPLAY.find((tz) => tz.id === value);
      const now = Temporal.Now.plainDateISO();
      return {
        timezones: TIMEZONES_DISPLAY,
        displayValue: timezone ?? getDisplayValue(value, now),
      };
    }

    const timezones = [
      ...TIMEZONES_DISPLAY.filter((timezone) => timezone.id === value),
      ...TIMEZONES_DISPLAY.filter((timezone) => timezone.id !== value),
    ];

    const timezone = timezones.find((tz) => tz.id === value);
    const now = Temporal.Now.plainDateISO();

    return {
      timezones,
      displayValue: timezone ?? getDisplayValue(value, now),
    };
  }, [value]);
}

interface UseSearchProps {
  timezones: TimeZoneDisplayValue[];
  search: string;
}

function useSearch({ timezones, search }: UseSearchProps) {
  return React.useMemo(() => {
    if (!search) {
      return timezones;
    }

    return matchSorter(timezones, search, {
      keys: [
        (item) => item.id,
        (item) => item.name,
        (item) => item.offset.label,
      ],
    });
  }, [timezones, search]);
}

interface TimezoneSelectProps {
  id?: string;
  className?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isDirty?: boolean;
}

export function TimezoneSelect({
  id,
  className,
  value,
  onChange,
  disabled,
}: TimezoneSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { timezones, displayValue } = useTimezoneList(value);

  const searchResults = useSearch({ timezones, search });

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
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            size="sm"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-start gap-2 px-2", className)}
            disabled={disabled}
          >
            <TimeZoneAwareGlobeIcon
              offset={displayValue?.offset.value ?? 0}
              className="size-4 text-muted-foreground hover:text-foreground"
            />
            {displayValue ? (
              <span
                className={cn(
                  "space-x-2 truncate text-sm",
                  !value && "text-muted-foreground",
                )}
              >
                <span className="pr-2">
                  <span className="text-muted-foreground/80">UTC</span>
                  <span className="inline-block w-12 text-muted-foreground/80">
                    {displayValue.offset.label}
                  </span>
                </span>
                {displayValue.name}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-96 min-w-(--radix-popper-anchor-width) p-0"
          align="end"
          side="bottom"
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
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  // Roughly estimate each row height – 32px covers typical list item.
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
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = timezones[virtualRow.index]!;

            return (
              <TimezoneListItem
                key={item.id}
                item={item}
                value={value}
                onSelect={onSelect}
                start={virtualRow.start}
              />
            );
          })}
        </div>
      </div>
    </CommandGroup>
  );
}

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
      className="absolute top-0 left-0 w-full text-sm tabular-nums [&_svg]:size-3.5"
      style={style}
    >
      <span>
        <span className="text-muted-foreground/80">UTC</span>
        <span className="inline-block w-12 text-muted-foreground/80">
          {item.offset.label}
        </span>
      </span>
      <span className="truncate">{item.fullName}</span>
      <span className="text-muted-foreground/80">({item.abbreviation})</span>
      {value === item.id ? <CheckIcon className="ml-auto" /> : null}
    </CommandItem>
  );
}

const MemoizedTimezoneList = React.memo(TimezoneList);

export const MemoizedTimezoneSelect = React.memo(TimezoneSelect);
