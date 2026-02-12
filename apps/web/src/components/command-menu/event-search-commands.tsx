"use client";

import { useCommandState } from "cmdk";
import { matchSorter } from "match-sorter";

import { CommandGroup, CommandItem } from "@/components/ui/command";
import { useEventsForDisplay } from "@/hooks/calendar/use-events";
import { useSelectAction } from "@/hooks/calendar/use-optimistic-mutations";
import { eventColorVariable } from "@/lib/css";
import { EventDisplayItem, isEvent } from "@/lib/display-item";
import { format } from "@/lib/utils/format";
import { useCalendarStore } from "@/providers/calendar-store-provider";

export function EventSearchCommands() {
  const search = useCommandState((state) => state.search);
  const { data } = useEventsForDisplay();
  const setCurrentDate = useCalendarStore((s) => s.setCurrentDate);
  const selectAction = useSelectAction();
  const use12Hour = useCalendarStore((s) => s.calendarSettings.use12Hour);
  const setOpen = useCalendarStore((s) => s.setCommandMenuOpen);

  if (!search || !data?.events || data.events.length === 0) {
    return null;
  }

  const searchResults = matchSorter(
    data.events.filter(isEvent) as EventDisplayItem[],
    search,
    {
      keys: [
        (item) => item.event.title ?? "",
        // TODO: Add location-based search
        // (item) => item.event.location ?? "",
      ],
      threshold: matchSorter.rankings.CONTAINS,
    },
  )
    .slice(0, 10)
    .map((item) => {
      const label = item.event.allDay
        ? format(item.start, "MMMM D, YYYY")
        : format(
            item.start,
            use12Hour ? "MMMM D, YYYY h:mm a" : "MMMM D, YYYY HH:mm",
          );

      return {
        ...item,
        label,
        color: `var(${eventColorVariable(item.event)}, var(--color-muted-foreground))`,
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
            setCurrentDate(item.date.start);
            selectAction(item.event);
            setOpen(false);
          }}
          keywords={["event", item.event.title ?? "(untitled)"]}
        >
          <div className="w-1 shrink-0 self-stretch py-0.75">
            <div
              className="h-full w-full rounded bg-event-selected-hover"
              style={{
                "--calendar-color": item.color,
              }}
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
