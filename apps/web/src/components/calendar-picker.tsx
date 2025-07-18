"use client";

import * as React from "react";
import { useResizeObserver } from "@react-hookz/web";

import { useCalendarPreferences } from "@/atoms";
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
import { useCalendars } from "@/hooks/use-calendars";
import { Calendar } from "@/lib/interfaces";
import { RouterOutputs } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { CalendarToggle } from "./calendar-toggle";

interface VisibleCalendarProps {
  calendars?: Calendar[];
}

function VisibleCalendars({ calendars }: VisibleCalendarProps) {
  return (
    <div className="flex -space-x-1">
      {calendars
        ?.slice(0, calendars.length > 3 ? 3 : calendars.length)
        .map((calendar) => (
          <div
            key={`${calendar.accountId}.${calendar.id}`}
            className="size-4 rounded-full bg-(--calendar-color) ring-2 ring-background group-hover/trigger:ring-border"
            style={
              {
                "--calendar-color": calendar.color ?? "var(--color-muted)",
              } as React.CSSProperties
            }
          ></div>
        ))}
    </div>
  );
}

function useCalendarList() {
  return useCalendars();
}

function CalendarListItem({ calendar }: { calendar: Calendar }) {
  const [calendarPreferences, setCalendarPreferences] =
    useCalendarPreferences();
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isTextTruncated, setIsTextTruncated] = React.useState(false);

  // Check for text truncation whenever the element resizes
  useResizeObserver(textRef, () => {
    const element = textRef.current;
    if (element) {
      setIsTextTruncated(element.scrollWidth > element.clientWidth);
    }
  });

  const handleCalendarVisibilityChange = React.useCallback(
    (checked: boolean, cal: Calendar) => {
      const key = `${cal.accountId}.${cal.id}`;
      setCalendarPreferences((prev) => ({
        ...prev,
        [key]: { ...prev[key], hidden: !checked },
      }));
    },
    [setCalendarPreferences],
  );

  const pref = calendarPreferences[`${calendar.accountId}.${calendar.id}`];
  const checked = !pref?.hidden;

  return (
    <CommandItem
      className="gap-3 ps-3"
      value={`${calendar.name}`}
      onSelect={() => {
        handleCalendarVisibilityChange(!checked, calendar);
      }}
    >
      <CalendarToggle
        style={
          {
            "--calendar-color":
              calendar.color ?? "var(--color-muted-foreground)",
          } as React.CSSProperties
        }
        className="dark:border-neutral-700"
        checked={checked}
        onCheckedChange={(checked: boolean) => {
          handleCalendarVisibilityChange(checked, calendar);
        }}
        primaryCalendar={calendar.primary}
      />
      {calendar.name}
    </CommandItem>
  );
}

export function CalendarPicker() {
  const [open, setOpen] = React.useState(false);

  const { data } = useCalendarList();

  const [calendarPreferences] = useCalendarPreferences();

  const visibleCalendars = React.useMemo(() => {
    return data?.accounts
      .flatMap((account) => account.calendars)
      .filter((calendar) => {
        const pref =
          calendarPreferences[`${calendar.accountId}.${calendar.id}`];
        return !pref?.hidden;
      });
  }, [data, calendarPreferences]);

  if (!data) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="group/trigger w-10 p-0 hover:bg-transparent dark:hover:bg-transparent"
          >
            <span className="sr-only">Select calendars</span>
            <VisibleCalendars calendars={visibleCalendars} />
          </Button>
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
                    <CalendarListItem
                      calendar={calendar}
                      key={`${account.id}-${calendar.id}`}
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

export type CalenderAccount = RouterOutputs["calendars"]["list"]["accounts"][0];

interface CalendarListPickerProps extends React.ComponentProps<typeof Popover> {
  items: CalenderAccount[];
  value?: Calendar;
  onSelect?: (calendar: Calendar) => void;
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
                    <CommandItem
                      value={`${calendar.name}`}
                      key={`${account.id}-${calendar.id}`}
                      onSelect={() => {
                        onSelect?.(calendar);
                        setOpen(false);
                      }}
                      disabled={calendar.readOnly}
                    >
                      <div className="size-5 p-1">
                        <div
                          className={cn(
                            "size-3 rounded-[4px] bg-(--calendar-color)",
                            calendar.primary &&
                              "outline-2 outline-offset-2 outline-(--calendar-color)",
                          )}
                          style={
                            {
                              "--calendar-color":
                                calendar.color ??
                                "var(--color-muted-foreground)",
                            } as React.CSSProperties
                          }
                        />
                      </div>
                      {calendar.name}
                    </CommandItem>
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
