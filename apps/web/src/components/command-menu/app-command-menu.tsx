import * as React from "react";
import { useCommandState } from "cmdk";
import { useAtom, useSetAtom } from "jotai";
import { useTheme } from "next-themes";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { useCalendarState } from "@/hooks/use-calendar-state";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export function AppCommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { disableScope, enableScope, activeScopes } = useHotkeysContext();

  React.useEffect(() => {
    if (open) {
      enableScope("command-menu");
      disableScope("calendar");
      disableScope("event");
    } else {
      enableScope("calendar");
      enableScope("event");
      disableScope("command-menu");
    }
  }, [open, disableScope, enableScope]);

  useHotkeys("mod+k", () => setOpen((open) => !open), {
    preventDefault: true,
  });

  const { setCurrentDate, setView } = useCalendarState();
  const { setTheme } = useTheme();
  const [preferences, setPreferences] = useAtom(viewPreferencesAtom);
  const setCalendarSettings = useSetAtom(calendarSettingsAtom);
  const [pages, setPages] = React.useState<string[]>([]);
  const page = pages[pages.length - 1];

  const action = (action: () => void) => {
    action();
    setOpen(false);
  };

  const CommandContent = () => {
    const search = useCommandState((state) => state.search);

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Backspace" && !search) {
          e.preventDefault();
          setPages((pages) => pages.slice(0, -1));
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [search]);

    return (
      <>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {!page ? (
            <CommandGroup heading="Calendar">
              <CommandItem
                value="today"
                onSelect={() =>
                  action(() => setCurrentDate(Temporal.Now.plainDateISO()))
                }
              >
                Today
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!page ? (
            <CommandGroup heading="Layout">
              <CommandItem
                value="month"
                onSelect={() => action(() => setView("month"))}
              >
                Switch to month view
              </CommandItem>
              <CommandItem
                value="week"
                onSelect={() => action(() => setView("week"))}
              >
                Switch to week view
              </CommandItem>
              <CommandItem
                value="day"
                onSelect={() => action(() => setView("day"))}
              >
                Switch to day view
              </CommandItem>
              <CommandItem
                value="agenda"
                onSelect={() => action(() => setView("agenda"))}
              >
                Switch to agenda view
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!page ? (
            <CommandGroup heading="Preferences">
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setPreferences((p) => ({
                      ...p,
                      showWeekends: !p.showWeekends,
                    })),
                  )
                }
              >
                {preferences.showWeekends ? "Hide weekends" : "Show weekends"}
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setPreferences((p) => ({
                      ...p,
                      showWeekNumbers: !p.showWeekNumbers,
                    })),
                  )
                }
              >
                {preferences.showWeekNumbers
                  ? "Hide week numbers"
                  : "Show week numbers"}
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setPreferences((p) => ({
                      ...p,
                      showDeclinedEvents: !p.showDeclinedEvents,
                    })),
                  )
                }
              >
                {preferences.showDeclinedEvents
                  ? "Hide declined events"
                  : "Show declined events"}
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!page ? (
            <CommandGroup heading="Appearance">
              <CommandItem onSelect={() => setPages([...pages, "theme"])}>
                Change theme
              </CommandItem>
            </CommandGroup>
          ) : null}

          {page === "theme" || search ? (
            <CommandGroup heading="Appearance">
              <CommandItem
                value="system"
                onSelect={() => action(() => setTheme("system"))}
              >
                Automatic (system)
              </CommandItem>
              <CommandItem
                value="light"
                onSelect={() => action(() => setTheme("light"))}
              >
                Light
              </CommandItem>
              <CommandItem
                value="dark"
                onSelect={() => action(() => setTheme("dark"))}
              >
                Dark
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!page ? (
            <CommandGroup heading="Localization">
              <CommandItem onSelect={() => setPages([...pages, "time-format"])}>
                Change time format
              </CommandItem>
            </CommandGroup>
          ) : null}

          {page === "time-format" || search ? (
            <CommandGroup heading="Localization">
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, use12Hour: false })),
                  )
                }
              >
                Use 24-hour clock
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, use12Hour: true })),
                  )
                }
              >
                Use 12-hour clock
              </CommandItem>
            </CommandGroup>
          ) : null}

          {!page ? (
            <CommandGroup heading="Calendar">
              <CommandItem
                onSelect={() => setPages([...pages, "start-of-week"])}
              >
                Change start of week
              </CommandItem>
            </CommandGroup>
          ) : null}

          {page === "start-of-week" || search ? (
            <CommandGroup heading="Calendar">
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 1 })),
                  )
                }
              >
                Monday
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 2 })),
                  )
                }
              >
                Tuesday
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 3 })),
                  )
                }
              >
                Wednesday
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 4 })),
                  )
                }
              >
                Thursday
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 5 })),
                  )
                }
              >
                Friday
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 6 })),
                  )
                }
              >
                Saturday
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 7 })),
                  )
                }
              >
                Sunday
              </CommandItem>
            </CommandGroup>
          ) : null}
        </CommandList>
      </>
    );
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="max-w-xl"
      showCloseButton={false}
    >
      <Command
        className="h-80 max-h-svh"
        onKeyDown={(e) => {
          // We'll handle this inside CommandContent where we have access to search state
          if (e.key === "Escape") {
            e.preventDefault();
            setPages((pages) => pages.slice(0, -1));
          }
        }}
      >
        <CommandContent />
      </Command>
    </CommandDialog>
  );
}
