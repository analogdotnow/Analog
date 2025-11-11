import * as React from "react";
import { useCommandState } from "cmdk";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { matchSorter } from "match-sorter";
import { useTheme } from "next-themes";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { Temporal } from "temporal-polyfill";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { viewPreferencesAtom } from "@/atoms/view-preferences";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { formatTime } from "@/lib/utils/format";
import { useEventsForDisplay } from "../calendar/hooks/use-events";
import { useSelectAction } from "../calendar/hooks/use-optimistic-mutations";
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

  const { setCurrentDate, setView, view } = useCalendarState();
  const { setTheme } = useTheme();
  const [preferences, setPreferences] = useAtom(viewPreferencesAtom);
  const setCalendarSettings = useSetAtom(calendarSettingsAtom);
  const calendarSettings = useAtomValue(calendarSettingsAtom);
  const [pages, setPages] = React.useState<string[]>([]);
  const page = pages[pages.length - 1];
  const { data } = useEventsForDisplay();
  const selectAction = useSelectAction();

  const eventsSnapshot = React.useMemo(
    () => data?.events ?? [],
    [open, data?.events],
  );

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

    const eventResults = React.useMemo(() => {
      if (!search || eventsSnapshot.length === 0) {
        return null;
      }

      return matchSorter(eventsSnapshot, search, {
        keys: [
          (event) => event.event.title ?? "",
          (event) => event.event.description ?? "",
          (event) => event.event.location ?? "",
        ],
      })
        .slice(0, 10)
        .map((item) => {
          const eventDate = item.start.toPlainDate();
          const formattedDate = eventDate.toLocaleString(
            calendarSettings.locale,
            {
              month: "short",
              day: "numeric",
            },
          );

          let timeInfo = "";
          if (!item.event.allDay) {
            const startTime = formatTime({
              value: item.start,
              use12Hour: calendarSettings.use12Hour,
              timeZone: calendarSettings.defaultTimeZone,
              locale: calendarSettings.locale,
            });
            timeInfo = ` at ${startTime}`;
          }

          return (
            <CommandItem
              key={`${item.event.id}-${item.start.epochMilliseconds}`}
              value={`event-${item.event.id}-${item.event.title}`}
              onSelect={() => {
                action(() => {
                  setCurrentDate(eventDate);
                  selectAction(item.event);
                });
              }}
            >
              <div className="flex flex-col">
                <span>{item.event.title || "(No title)"}</span>
                <span className="text-xs text-muted-foreground">
                  {formattedDate}
                  {timeInfo}
                </span>
              </div>
            </CommandItem>
          );
        });
    }, [search, eventsSnapshot, calendarSettings]);

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

          {eventResults && eventResults.length > 0 ? (
            <CommandGroup heading="Events">{eventResults}</CommandGroup>
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
