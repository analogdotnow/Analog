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
  value: {
    id: string;
    provider: {
      id: "google" | "microsoft";
      accountId: string;
    };
  };
  onChange: (calendar: {
    id: string;
    provider: {
      id: "google" | "microsoft";
      accountId: string;
    };
  }) => void;
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
      onChange({ id: calendar.id, provider: calendar.provider });
      onBlur();
    },
    [onChange, onBlur],
  );

  const selected = React.useMemo(() => {
    return data?.accounts
      .flatMap((item) => item.calendars)
      .find((item) => item.id === value.id);
  }, [data, value]);

  return (
    <CalendarListPicker items={items} onSelect={onSelect} value={selected}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="ghost"
            className={cn(
              "flex h-8 w-full grow items-center justify-start gap-2 text-sm font-medium hover:bg-accent-light focus:bg-accent-light focus:ring-0 focus:ring-offset-0 focus-visible:bg-accent-light focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-accent-light dark:hover:bg-accent-light dark:focus:bg-accent-light dark:focus-visible:bg-accent-light data-[state=open]:dark:bg-accent-light",
              className,
            )}
            disabled={disabled}
          />
        }
      >
        <CalendarColorIndicator
          primary={selected?.primary ?? false}
          calendarId={selected?.id ?? ""}
          providerAccountId={selected?.provider.accountId ?? ""}
          disabled={disabled}
        />
      </PopoverTrigger>
    </CalendarListPicker>
  );
}

interface CalendarColorIndicatorProps {
  primary: boolean;
  calendarId: string;
  providerAccountId: string;
  className?: string;
  disabled?: boolean;
}

export function CalendarColorIndicator({
  primary,
  calendarId,
  providerAccountId,
  className,
  disabled,
}: CalendarColorIndicatorProps) {
  const color = `var(${calendarColorVariable(providerAccountId, calendarId)}, var(--color-muted-foreground))`;

  return (
    <div className={cn("size-5 p-1", className)}>
      <div
        className={cn(
          "size-3 rounded-[4px] bg-(--calendar-color)",
          primary && "outline-2 outline-offset-2 outline-(--calendar-color)",
          disabled && "opacity-50",
        )}
        style={{
          "--calendar-color": color,
        }}
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
  const canMove = !calendar.readOnly && calendar.provider.id === "google";

  return (
    <CommandItem
      value={`${calendar.name}`}
      onSelect={() => onSelect(calendar)}
      disabled={!canMove}
    >
      <CalendarColorIndicator
        primary={calendar.primary}
        calendarId={calendar.id}
        providerAccountId={calendar.provider.accountId}
      />
      <span className="flex-1 truncate">{calendar.name}</span>
    </CommandItem>
  );
}

interface CalendarListPickerProps extends Omit<
  React.ComponentProps<typeof Popover>,
  "children"
> {
  children: React.ReactNode;
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
                      key={`${calendar.provider.accountId}-${calendar.id}`}
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
