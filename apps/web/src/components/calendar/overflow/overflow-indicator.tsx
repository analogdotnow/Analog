"use client";

import * as React from "react";
import { format } from "date-fns";
import { useAtomValue } from "jotai";
import { XIcon } from "lucide-react";
import { Temporal } from "temporal-polyfill";

import { isSameDay, toDate } from "@repo/temporal";

import { calendarSettingsAtom } from "@/atoms/calendar-settings";
import { EventItem } from "@/components/calendar/event/event-item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CalendarEvent } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import { EventCollectionItem } from "../hooks/event-collection";
import { useSelectAction } from "../hooks/use-optimistic-mutations";

interface OverflowIndicatorProps {
  count: number;
  items: EventCollectionItem[];
  date: Temporal.PlainDate;

  gridColumn?: string;
  className?: string;
}

export function OverflowIndicator({
  count,
  items,
  date,

  gridColumn,
  className,
}: OverflowIndicatorProps) {
  const [open, setOpen] = React.useState(false);

  const timeZone = useAtomValue(calendarSettingsAtom).defaultTimeZone;

  const selectAction = useSelectAction();
  const handleEventClick = React.useCallback(
    (event: CalendarEvent) => {
      selectAction(event);
      setOpen(false);
    },
    [selectAction],
  );

  if (count <= 0) {
    return null;
  }

  const legacyDate = toDate(date, { timeZone });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "pointer-events-auto text-xs text-muted-foreground hover:text-foreground",
            "rounded-md px-2 py-1 transition-colors hover:bg-muted/50",
            className,
          )}
          style={gridColumn ? { gridColumn } : undefined}
        >
          +{count} more
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <h3 className="text-sm font-medium">
            {format(legacyDate, "d MMMM yyyy")}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-auto px-2 pb-2">
          {items.length === 0 ? (
            <div className="py-2 text-sm text-muted-foreground">No events</div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const eventStart = item.start.toPlainDate();
                const eventEnd = item.end.toPlainDate();
                const isFirstDay = isSameDay(date, eventStart);
                const isLastDay = isSameDay(date, eventEnd);

                return (
                  <div
                    key={item.event.id}
                    className="cursor-pointer"
                    onClick={() => handleEventClick(item.event)}
                  >
                    <EventItem
                      item={item}
                      view="agenda"
                      isFirstDay={isFirstDay}
                      isLastDay={isLastDay}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
