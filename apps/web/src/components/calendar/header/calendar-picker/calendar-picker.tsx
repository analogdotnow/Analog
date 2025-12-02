"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

import {
  calendarPreferencesAtom,
  getCalendarPreference,
} from "@/atoms/calendar-preferences";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { calendarColorVariable } from "@/lib/css";
import { Calendar } from "@/lib/interfaces";
import { useTRPC } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import {
  CalendarPickerItem,
  CalendarPickerItemActionsMenu,
  CalendarPickerItemContent,
} from "./calendar-picker-item";
import {
  CalendarPickerProvider,
  useCalendarPickerContext,
} from "./calendar-picker-provider";

interface VisibleCalendarItemProps {
  className?: string;
  calendar: Calendar;
}

function VisibleCalendarItem({
  className,
  calendar,
}: VisibleCalendarItemProps) {
  return (
    <div
      className={cn(
        "size-4 rounded-full bg-(--calendar-color) ring-2 ring-background group-hover/trigger:ring-border",
        className,
      )}
      style={
        {
          "--calendar-color": `var(${calendarColorVariable(calendar.provider.accountId, calendar.id)}, var(--color-muted-foreground))`,
        } as React.CSSProperties
      }
    />
  );
}

interface VisibleCalendarProps {
  className?: string;
  calendars?: Calendar[];
}

function VisibleCalendars({ className, calendars }: VisibleCalendarProps) {
  "use memo";

  if (!calendars || calendars.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex -space-x-1", className)}>
      {calendars.slice(0, Math.min(calendars.length, 3)).map((calendar) => (
        <VisibleCalendarItem
          key={`${calendar.provider.accountId}.${calendar.id}`}
          calendar={calendar}
        />
      ))}
    </div>
  );
}

function CalendarPickerContent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.calendars.list.queryOptions());
  const [open, setOpen] = React.useState(false);
  const [calendarPreferences] = useAtom(calendarPreferencesAtom);
  const { isActionMenuOpen } = useCalendarPickerContext();

  const visibleCalendars = React.useMemo(() => {
    return data?.accounts
      .flatMap((account) => account.calendars)
      .filter((calendar) => {
        const preference = getCalendarPreference(
          calendarPreferences,
          calendar.provider.accountId,
          calendar.id,
        );
        return !preference?.hidden;
      });
  }, [data, calendarPreferences]);

  if (!data) {
    return null;
  }

  return (
    <div className="flex items-center">
      <Popover
        open={open}
        onOpenChange={(nextOpen, eventDetails) => {
          if (nextOpen) {
            setOpen(nextOpen);
            return;
          }

          if (isActionMenuOpen) {
            eventDetails.cancel();
            return;
          }

          setOpen(nextOpen);
        }}
      >
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="group/trigger w-10 p-0 hover:bg-transparent dark:hover:bg-transparent"
            />
          }
        >
          <span className="sr-only">Displayed calendars</span>
          <VisibleCalendars calendars={visibleCalendars} />
        </PopoverTrigger>
        <PopoverContent
          className="w-fit max-w-72 min-w-64 p-0"
          side="bottom"
          align="center"
        >
          <Command>
            <CommandInput placeholder="Search calendars..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {data.accounts.map((account) => (
                <CommandGroup
                  heading={account.name}
                  key={account.id}
                  value={account.name}
                >
                  {account.calendars.map((calendar) => (
                    <CalendarPickerItem
                      calendar={calendar}
                      key={`${calendar.provider.accountId}-${calendar.id}`}
                    >
                      <CalendarPickerItemContent>
                        <CalendarPickerItemActionsMenu />
                      </CalendarPickerItemContent>
                    </CalendarPickerItem>
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

export function CalendarPicker() {
  return (
    <CalendarPickerProvider>
      <CalendarPickerContent />
    </CalendarPickerProvider>
  );
}
