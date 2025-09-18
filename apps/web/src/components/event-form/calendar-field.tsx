import * as React from "react";
import { useQuery } from "@tanstack/react-query";

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
import { calendarColorVariable } from "@/lib/css";
import type { Calendar } from "@/lib/interfaces";
import type { RouterOutputs } from "@/lib/trpc";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface CalendarFieldProps {
  id: string;
  className?: string;
  value: { accountId: string; calendarId: string };
  onChange: (calendar: { accountId: string; calendarId: string }) => void;
  onBlur: () => void;
  disabled?: boolean;
}

export function CalendarField({
  id,
  className,
  value,
  onChange,
  onBlur,
  disabled,
}: CalendarFieldProps) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());

  const items = React.useMemo(() => {
    return data?.accounts ?? [];
  }, [data]);

  const onSelect = React.useCallback(
    (calendar: Calendar) => {
      onChange({ accountId: calendar.accountId, calendarId: calendar.id });
      onBlur();
    },
    [onChange, onBlur],
  );

  const selected = React.useMemo(() => {
    return data?.accounts
      .flatMap((item) => item.calendars)
      .find((item) => item.id === value.calendarId);
  }, [data, value]);

  return (
    <CalendarListPicker items={items} onSelect={onSelect} value={selected}>
      <PopoverTrigger
        id={id}
        className={cn(
          "flex h-8 w-full items-center gap-2 font-medium",
          className,
        )}
        disabled={disabled}
        asChild
      >
        <Button
          variant="ghost"
          className="grow justify-start text-sm hover:bg-input-focus focus:bg-input-focus focus:ring-0 focus:ring-offset-0 focus-visible:bg-input-focus focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-input-focus dark:hover:bg-input-focus dark:focus:bg-input-focus dark:focus-visible:bg-input-focus data-[state=open]:dark:bg-input-focus"
        >
          <CalendarColorIndicator
            primary={selected?.primary ?? false}
            calendarId={selected?.id ?? ""}
            accountId={selected?.accountId ?? ""}
            disabled={disabled}
          />
          {selected?.name}
        </Button>
      </PopoverTrigger>
    </CalendarListPicker>
  );
}

interface CalendarColorIndicatorProps {
  primary: boolean;
  calendarId: string;
  accountId: string;
  className?: string;
  disabled?: boolean;
}

export function CalendarColorIndicator({
  primary,
  calendarId,
  accountId,
  className,
  disabled,
}: CalendarColorIndicatorProps) {
  const color = `var(${calendarColorVariable(accountId, calendarId)}, var(--color-muted-foreground))`;

  return (
    <div className={cn("size-5 p-1", className)}>
      <div
        className={cn(
          "size-3 rounded-[4px] bg-(--calendar-color)",
          primary && "outline-2 outline-offset-2 outline-(--calendar-color)",
          disabled && "opacity-50",
        )}
        style={
          {
            "--calendar-color": color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

export type CalenderAccount = RouterOutputs["calendars"]["list"]["accounts"][0];

interface CalendarListPickerItemProps {
  calendar: Calendar;
  onSelect: (calendar: Calendar) => void;
}

export function CalendarListPickerItem({
  calendar,
  onSelect,
}: CalendarListPickerItemProps) {
  const canMove = !calendar.readOnly && calendar.providerId === "google";

  return (
    <CommandItem
      value={`${calendar.name}`}
      onSelect={() => onSelect(calendar)}
      disabled={!canMove}
    >
      <CalendarColorIndicator
        primary={calendar.primary}
        calendarId={calendar.id}
        accountId={calendar.accountId}
      />
      <span className="flex-1 truncate">{calendar.name}</span>
    </CommandItem>
  );
}

interface CalendarListPickerProps extends React.ComponentProps<typeof Popover> {
  items: CalenderAccount[];
  value?: Calendar;
  onSelect: (calendar: Calendar) => void;
}

export function CalendarListPicker({
  children,
  items,
  onSelect,
  ...props
}: CalendarListPickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen} {...props}>
        {children}
        <PopoverContent
          className="w-fit max-w-96 min-w-(--radix-popper-anchor-width) p-0"
          align="end"
          side="bottom"
          sideOffset={4}
        >
          <Command>
            <CommandInput placeholder="Search calendars..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {items.map((account) => (
                <CommandGroup
                  heading={account.name}
                  key={account.id}
                  value={account.name}
                >
                  {account.calendars.map((calendar) => (
                    <CalendarListPickerItem
                      key={`${calendar.accountId}-${calendar.id}`}
                      calendar={calendar}
                      onSelect={onSelect}
                    />
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
