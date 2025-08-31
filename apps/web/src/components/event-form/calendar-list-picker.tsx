"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { calendarColorVariable } from "@/lib/css";
import { Calendar } from "@/lib/interfaces";
import { RouterOutputs } from "@/lib/trpc";
import { cn } from "@/lib/utils";

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
  value,
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
          className="w-(--radix-popper-anchor-width) p-0"
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
