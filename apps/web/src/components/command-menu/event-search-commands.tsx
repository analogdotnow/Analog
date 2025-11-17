import { format } from "@formkit/tempo";
import { useCommandState } from "cmdk";
import { useAtomValue, useSetAtom } from "jotai";
import { matchSorter } from "match-sorter";

import { toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { commandMenuOpenAtom } from "@/atoms/command-menu";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import { useCalendarState } from "@/hooks/use-calendar-state";
import { calendarColorVariable } from "@/lib/css";
import { useEventsForDisplay } from "../calendar/hooks/use-events";
import { useSelectAction } from "../calendar/hooks/use-optimistic-mutations";

export function EventSearchCommands() {
  const search = useCommandState((state) => state.search);
  const { data } = useEventsForDisplay();
  const { setCurrentDate } = useCalendarState();
  const selectAction = useSelectAction();
  const { use12Hour } = useAtomValue(calendarSettingsAtom);
  const setOpen = useSetAtom(commandMenuOpenAtom);

  if (!search || !data?.events || data.events.length === 0) {
    return null;
  }

  const searchResults = matchSorter(data.events, search, {
    keys: [
      (item) => item.event.title ?? "",
      // TODO: Add location-based search
      // (item) => item.event.location ?? "",
    ],
    threshold: matchSorter.rankings.CONTAINS,
  })
    .slice(0, 10)
    .map((item) => {
      const date = toDate(item.start);
      const label = item.event.allDay
        ? format(date, "MMMM D, YYYY")
        : format(
            date,
            use12Hour ? "MMMM D, YYYY h:mm a" : "MMMM D, YYYY HH:mm",
          );

      const color =
        item.event.color ??
        `var(${calendarColorVariable(item.event.accountId, item.event.calendarId)}, var(--color-muted-foreground))`;

      return {
        ...item,
        label,
        color,
      };
    });

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Events">
      {searchResults.map((item) => (
        <CommandItem
          key={item.event.id}
          value={item.event.id}
          onSelect={() => {
            setCurrentDate(item.start.toPlainDate());
            selectAction(item.event);
            setOpen(false);
          }}
          keywords={["event", item.event.title ?? "(untitled)"]}
        >
          <div className="w-1 shrink-0 self-stretch py-0.75">
            <div
              className="h-full w-full rounded bg-[color-mix(in_oklab,var(--background),var(--calendar-color)_90%)]"
              style={
                {
                  "--calendar-color": item.color,
                } as React.CSSProperties
              }
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <span>{item.event.title ?? "(untitled)"}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
