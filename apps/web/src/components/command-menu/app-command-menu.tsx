import * as React from "react";
import { useCommandState } from "cmdk";
import { useAtom, useSetAtom } from "jotai";
import { useTheme } from "next-themes";
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
  CommandSeparator,
} from "../ui/command";

const CommandSubItem = (props: React.ComponentProps<typeof CommandItem>) => {
  const search = useCommandState((state) => state.search);
  if (!search) return null;
  return <CommandItem {...props} />;
};

type CommandPage = "theme" | "time-format" | "start-of-week" | "account";

export function AppCommandMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { setCurrentDate, setView } = useCalendarState();
  const { setTheme } = useTheme();
  const [preferences, setPreferences] = useAtom(viewPreferencesAtom);
  const setCalendarSettings = useSetAtom(calendarSettingsAtom);
  const [pages, setPages] = React.useState<string[]>([]);
  const page = pages[pages.length - 1];

  const [search, setSearch] = React.useState("");
  const action = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <CommandDialog open={true} onOpenChange={setOpen} className="max-w-xl" showCloseButton={false}>
      <Command className=""
        onKeyDown={(e) => {
          // Escape goes to previous page
          // Backspace goes to previous page when search is empty
          if (e.key === "Escape" || (e.key === "Backspace" && !search)) {
            e.preventDefault();
            setPages((pages) => pages.slice(0, -1));
          }
        }}
      >
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

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

          {page === "theme" ? (
            <CommandGroup heading="Appearance">
              <CommandSubItem
                value="system"
                onSelect={() => action(() => setTheme("system"))}
              >
                Automatic (system)
              </CommandSubItem>
              <CommandSubItem
                value="light"
                onSelect={() => action(() => setTheme("light"))}
              >
                Light
              </CommandSubItem>
              <CommandSubItem
                value="dark"
                onSelect={() => action(() => setTheme("dark"))}
              >
                Dark
              </CommandSubItem>
            </CommandGroup>
          ) : null}

          {page === "time-format" ? (
            <CommandItem onSelect={() => setPages([...pages, "time-format"])}>
              Change time format
            </CommandItem>
          ) : null}

          {page === "time-format" ? (
            <>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, use12Hour: false })),
                  )
                }
              >
                Use 24-hour time format
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, use12Hour: true })),
                  )
                }
              >
                Use 12-hour time format
              </CommandSubItem>
            </>
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

          {page === "start-of-week" ? (
            <CommandGroup heading="Calendar">
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 1 })),
                  )
                }
              >
                Monday
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 2 })),
                  )
                }
              >
                Tuesday
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 3 })),
                  )
                }
              >
                Wednesday
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 4 })),
                  )
                }
              >
                Thursday
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 5 })),
                  )
                }
              >
                Friday
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 6 })),
                  )
                }
              >
                Saturday
              </CommandSubItem>
              <CommandSubItem
                onSelect={() =>
                  action(() =>
                    setCalendarSettings((p) => ({ ...p, weekStartsOn: 7 })),
                  )
                }
              >
                Sunday
              </CommandSubItem>
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
